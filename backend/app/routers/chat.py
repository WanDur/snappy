"""
Component for all chat related logics and routes
"""

from datetime import datetime
import random
import string
from typing import Annotated, Optional
from odmantic import ObjectId
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import ORJSONResponse
from pydantic import BaseModel

from internal.models import Attachment, Message, User, Conversation
from utils.auth import get_user
from utils.debug import log_debug
from utils.minio import upload_file
from utils.mongo import engine, serialize_mongo_object

chat_router = APIRouter(prefix="/chat", tags=["chat"])


class CreateDirectChatBody(BaseModel):
    targetUserId: ObjectId


class CreateDirectChatResponse(BaseModel):
    conversationId: ObjectId


# region create chat


@chat_router.post("/create/direct")
async def create_direct_chat(
    body: CreateDirectChatBody, user: User | None = Depends(get_user)
) -> CreateDirectChatResponse:
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    target_user = await engine.find_one(User, User.id == body.targetUserId)
    if target_user is None:
        raise HTTPException(status_code=404, detail="Target user not found")

    # Check if the user is already in a conversation with the target user
    existing_conversation = await Conversation.find_direct_conversation(
        user, target_user
    )
    if existing_conversation:
        raise HTTPException(
            status_code=400, detail="Conversation with this user already exists"
        )

    # Create a new conversation
    conversation = Conversation(
        type="direct",
        createdAt=datetime.now(),
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
    body: CreateGroupChatBody, user: User | None = Depends(get_user)
) -> CreateGroupChatResponse:
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Validate participants
    if len(body.participants) < 2:
        raise HTTPException(status_code=400, detail="At least 2 participants required")

    # Create a new conversation
    conversation = Conversation(
        type="group",
        createdAt=datetime.now(),
        createdBy=user,
        participants=body.participants,
    )
    await engine.save(conversation)
    return ORJSONResponse({"conversationId": str(conversation.id)})


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
        timestamp=datetime.now(),
    )

    if attachments:
        msg_attachments = []
        for afile in attachments:
            if afile.content_type not in ALLOWED_FILE_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid file type.",
                )
            filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{afile.filename}"
            file_url = await upload_file(
                f"chat/{conversation.id}/{filename}",
                afile.file,
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

    # TODO: send notifications to participants
    return ORJSONResponse(
        serialize_mongo_object(
            {
                "messageId": str(msg.id),
                "senderId": str(user.id),
                "message": msg.message,
                "attachments": msg.attachments,
            }
        )
    )
