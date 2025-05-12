"""
Component for all chat related logics and routes
"""

from datetime import datetime, timezone
import random
import string
from typing import Annotated, Optional
from odmantic import AIOEngine, ObjectId
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    WebSocket,
    WebSocketException,
)
from fastapi.responses import ORJSONResponse
from pydantic import BaseModel
from yaml import serialize

from internal.models import Attachment, ConversationType, Message, User, Conversation
from utils.auth import get_user, get_user_from_token
from utils.debug import log_debug
from utils.minio import upload_file
from utils.mongo import engine, serialize_mongo_object, get_prod_database

chat_router = APIRouter(prefix="/chat", tags=["chat"])


class CreateDirectChatBody(BaseModel):
    targetUserId: ObjectId


class CreateDirectChatResponse(BaseModel):
    conversationId: ObjectId


# region create chat


@chat_router.post("/create/direct")
async def create_direct_chat(
    body: CreateDirectChatBody,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
) -> CreateDirectChatResponse:
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    target_user = await engine.find_one(User, User.id == body.targetUserId)
    if target_user is None:
        raise HTTPException(status_code=404, detail="Target user not found")

    # Check if the user is already in a conversation with the target user
    existing_conversation_id = await Conversation.find_direct_conversation_id(
        engine, user, target_user
    )
    if existing_conversation_id:
        log_debug(
            f"Conversation with {target_user.id} already exists: {existing_conversation_id}"
        )
        raise HTTPException(
            status_code=409,
            detail={
                "message": "Conversation with this user already exists",
                "conversationId": str(existing_conversation_id),
            },
        )

    # Create a new conversation
    conversation = Conversation(
        type="direct",
        createdAt=datetime.now(timezone.utc),
        createdBy=user,
        participants=[user.id, body.targetUserId],
    )
    await engine.save(conversation)
    return ORJSONResponse({"conversationId": str(conversation.id)})


class CreateGroupChatBody(BaseModel):
    name: Optional[str] = None
    participants: list[ObjectId]


class CreateGroupChatResponse(BaseModel):
    conversationId: ObjectId


@chat_router.post("/create/group")
async def create_group_chat(
    body: CreateGroupChatBody,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
) -> CreateGroupChatResponse:
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Validate participants
    if len(body.participants) < 2:
        raise HTTPException(status_code=400, detail="At least 2 participants required")

    # Create a new conversation
    conversation = Conversation(
        type="group",
        createdAt=datetime.now(timezone.utc),
        createdBy=user,
        participants=body.participants,
    )
    await engine.save(conversation)
    return ORJSONResponse({"conversationId": str(conversation.id)})


# region websocket


active_connections: dict[ObjectId, list[WebSocket]] = {}


@chat_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    auth_header = websocket.headers.get("Authorization")
    if not auth_header:
        raise WebSocketException(code=1008, reason="Unauthorized")
    token = auth_header.split(" ")[1]
    if not token:
        raise WebSocketException(code=1008, reason="Unauthorized")
    user = await get_user_from_token(token)

    if user is None:
        raise WebSocketException(code=1008, reason="Unauthorized")

    await websocket.accept()
    if user.id not in active_connections:
        active_connections[user.id] = []
    else:
        active_connections[user.id].append(websocket)
    log_debug(f"User {user.id} connected to WebSocket")

    try:
        while True:
            await websocket.receive()
    except:
        active_connections[user.id].remove(websocket)
        if not active_connections[user.id]:
            del active_connections[user.id]
        log_debug(f"User {user.id} disconnected from WebSocket")


# region send message


class ConversationParticipantInfo(BaseModel):
    userId: ObjectId
    username: str
    name: str
    iconUrl: Optional[str]


class ConversationInfoResponse(BaseModel):
    conversationId: ObjectId
    conversationType: ConversationType
    participants: list[ConversationParticipantInfo]
    lastMessageTime: datetime
    initialDate: datetime
    # unreadCount: int


@chat_router.get("/conversation/{conversation_id}/info")
async def get_conversation_info(
    conversation_id: ObjectId,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
) -> ConversationInfoResponse:
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    conversation = await engine.find_one(
        Conversation, Conversation.id == conversation_id
    )
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if user.id not in conversation.participants:
        raise HTTPException(status_code=401, detail="User not in conversation")

    participants = []
    for participant in conversation.participants:
        user = await engine.find_one(User, User.id == participant)
        if not user:
            log_debug(f"User {participant} not found")
            continue
        participants.append(
            ConversationParticipantInfo(
                userId=participant,
                username=user.username,
                name=user.name,
                iconUrl=user.iconUrl,
            )
        )

    return ORJSONResponse(
        serialize_mongo_object(
            {
                "conversationId": str(conversation.id),
                "conversationType": conversation.type,
                "participants": participants,
                "lastMessageTime": await conversation.get_last_message_time(engine),
                "initialDate": conversation.createdAt,
            }
        )
    )


class SendMessageResponse(BaseModel):
    messageId: ObjectId
    senderId: ObjectId
    message: str
    attachments: list[Attachment]


ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "audio/mpeg"]


@chat_router.post("/conversation/{conversation_id}/send")
async def send_message(
    conversation_id: ObjectId,
    message: Annotated[str, Form()],
    attachments: Optional[list[UploadFile]] = None,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
) -> SendMessageResponse:
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    conversation = await engine.find_one(
        Conversation, Conversation.id == conversation_id
    )
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if user.id not in conversation.participants:
        raise HTTPException(status_code=401, detail="User not in conversation")

    msg = Message(
        conversation=conversation,
        sender=user,
        message=message,
        timestamp=datetime.now(timezone.utc),
    )

    if attachments:
        msg_attachments = []
        for afile in attachments:
            if afile.content_type not in ALLOWED_FILE_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid file type.",
                )
            filename = f"{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{afile.filename}"
            file_data = await afile.read()
            file_url = upload_file(
                f"chat/{conversation.id}/{filename}",
                file_data,
                metadata={"messageId": str(msg.id), "originalName": afile.filename},
            )
            msg_attachments.append(
                Attachment(
                    type=afile.content_type.split("/")[0],
                    name=filename,
                    url=file_url,
                )
            )
        msg.attachments = msg_attachments
    await engine.save(msg)

    # Send messages to participants via WebSocket
    for participant in conversation.participants:
        if participant != user.id and participant in active_connections:
            log_debug(f"Sending message to participant {participant}")
            for connection in active_connections[participant]:
                log_debug(f"Sending message to connection {connection}")
                await connection.send_json(
                    serialize_mongo_object(
                        {
                            "conversationId": str(conversation.id),
                            "messageId": str(msg.id),
                            "senderId": str(user.id),
                            "message": msg.message,
                            "timestamp": msg.timestamp,
                            "attachments": msg.attachments,
                        }
                    )
                )

    return ORJSONResponse(
        serialize_mongo_object(
            {
                "messageId": str(msg.id),
                "senderId": str(user.id),
                "message": msg.message,
                "timestamp": msg.timestamp,
                "attachments": msg.attachments,
            }
        )
    )


# region fetch new messages


class MessageResponse(BaseModel):
    messageId: ObjectId
    senderId: ObjectId
    message: str
    timestamp: datetime
    attachments: list[Attachment]


class ConversationResponse(BaseModel):
    conversationId: ObjectId
    conversationType: ConversationType
    lastMessageTime: datetime
    messages: list[MessageResponse]


class FetchNewMessagesResponse(BaseModel):
    chats: list[ConversationResponse]


@chat_router.get("/fetch")
async def fetch_messages(
    since: Optional[datetime] = None,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
) -> FetchNewMessagesResponse:
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    conversation_ids = await Conversation.find_conversation_ids(engine, user)
    new_messages = []
    for conversation_id in conversation_ids:
        from odmantic.query import and_

        query = and_(
            {"conversation": conversation_id},
            {"timestamp": {"$gt": since}} if since else {},
        )
        conversation = await engine.find_one(
            Conversation, Conversation.id == conversation_id
        )
        messages = await engine.find(
            Message,
            query,
            sort=Message.timestamp.desc(),
        )
        if messages:
            new_chat_conversations = {
                "conversationId": str(conversation_id),
                "conversationType": conversation.type,
                "lastMessageTime": await conversation.get_last_message_time(engine),
                "messages": [
                    {
                        "messageId": str(message.id),
                        "senderId": str(message.sender.id),
                        "message": message.message,
                        "timestamp": message.timestamp,
                        "attachments": message.attachments,
                    }
                    for message in messages
                ],
            }
            new_messages.append(new_chat_conversations)
    return ORJSONResponse({"chats": serialize_mongo_object(new_messages)})


@chat_router.get("/fetch_history")
async def fetch_history(
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
):
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    conversation_ids = await Conversation.find_conversation_ids(engine, user)

    response = []

    for conversation_id in conversation_ids:
        conversation = await engine.find_one(
            Conversation, Conversation.id == conversation_id
        )
        messages = await engine.find(
            Message,
            Message.conversation == conversation_id,
            sort=Message.timestamp.desc(),
        )
        response.append(
            {
                "conversationId": str(conversation_id),
                "conversationType": conversation.type,
                "lastMessageTime": await conversation.get_last_message_time(engine),
                "messages": [
                    {
                        "messageId": str(message.id),
                        "senderId": str(message.sender.id),
                        "message": message.message,
                        "timestamp": message.timestamp,
                        "attachments": message.attachments,
                    }
                    for message in messages
                ],
            }
        )

    return ORJSONResponse({"chats": serialize_mongo_object(response)})
