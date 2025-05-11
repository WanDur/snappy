"""
Component for all albums related logics and routes
"""

from datetime import datetime, timezone
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile
from fastapi.responses import ORJSONResponse
from odmantic import AIOEngine, ObjectId
from pydantic import BaseModel

from utils.minio import optimize_image, upload_file_stream
from utils.debug import log_debug
from utils.auth import get_user
from utils.mongo import engine, serialize_mongo_object, get_prod_database
from internal.models import Album, AlbumPhoto, Friendship, User

album_router = APIRouter(prefix="/album", tags=["album"])


class CreateAlbumBody(BaseModel):
    name: str
    participants: list[ObjectId]


@album_router.post("/create")
async def create_album(
    body: CreateAlbumBody,
    user: User | None = Depends(get_user),
    engine: AIOEngine = Depends(get_prod_database),
) -> dict[str, str]:
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if len(body.participants) < 1:
        raise HTTPException(
            status_code=400, detail="At least one participant is required"
        )

    if user.id not in body.participants:
        raise HTTPException(
            status_code=400, detail="You must be a participant to create an album"
        )

    # Validate participant lists
    for participantId in body.participants:
        if participantId == user.id:
            continue
        puser = await engine.find_one(User, User.id == participantId)
        if puser is None:
            raise HTTPException(
                status_code=400, detail=f"Invalid participant: {participantId}"
            )
        if not await Friendship.are_friends(engine, user, puser):
            raise HTTPException(
                status_code=400,
                detail=f"User @{puser.username} is not a friend",
            )

    album = Album(
        name=body.name,
        participants=body.participants,
        createdAt=datetime.now(timezone.utc),
        createdBy=user,
    )
    await engine.save(album)

    return ORJSONResponse(
        serialize_mongo_object({"albumId": album.id, "createdAt": album.createdAt})
    )


class EditAlbumBody(BaseModel):
    name: Optional[str] = None
    participants: Optional[list[ObjectId]] = None


@album_router.post("/{album_id}/edit")
async def edit_album(
    album_id: ObjectId,
    body: EditAlbumBody,
    user: User | None = Depends(get_user),
    engine: AIOEngine = Depends(get_prod_database),
) -> dict[str, str]:
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    album = await engine.find_one(Album, Album.id == album_id)
    if album is None:
        raise HTTPException(status_code=404, detail="Album not found")

    if album.createdBy != user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if album.name and album.name != "":
        album.name = body.name
    if body.participants:
        # Validate participant lists
        for participantId in body.participants:
            if participantId == user.id:
                continue
            puser = await engine.find_one(User, User.id == participantId)
            if puser is None:
                raise HTTPException(
                    status_code=400, detail=f"Invalid participant: {participantId}"
                )
            if not await Friendship.are_friends(engine, user, puser):
                raise HTTPException(
                    status_code=400,
                    detail=f"User @{puser.username} is not a friend",
                )
        album.participants = body.participants
    await engine.save(album)

    return ORJSONResponse(
        serialize_mongo_object(
            {
                "name": album.name,
                "participants": album.participants,
                "createdAt": album.createdAt,
            }
        )
    )


@album_router.post("/{album_id}/upload")
async def upload_photo(
    album_id: ObjectId,
    file: UploadFile,
    caption: Annotated[Optional[str], Form()] = None,
    user: User | None = Depends(get_user),
    engine: AIOEngine = Depends(get_prod_database),
) -> dict[str, str]:
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    album = await engine.find_one(Album, Album.id == album_id)
    if album is None:
        raise HTTPException(status_code=404, detail="Album not found")

    # Check if the file is an image
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File is not an image")

    # Optimize and upload the image
    optimized_image = optimize_image(await file.read())
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    file_path = upload_file_stream(
        f"albums/{album_id}/photos/{timestamp}.jpg", optimized_image
    )

    photo = AlbumPhoto(
        url=file_path,
        caption=caption,
        album=album,
        user=user,
        timestamp=datetime.now(timezone.utc),
    )
    await engine.save(photo)

    return ORJSONResponse(
        serialize_mongo_object(
            {
                "photoId": photo.id,
                "filePath": file_path,
            }
        )
    )


@album_router.get("/{album_id}/fetch")
async def fetch_album(
    album_id: ObjectId,
    fromYear: int,
    fromWeek: int,
    toYear: int,
    toWeek: int,
    user: User | None = Depends(get_user),
    engine: AIOEngine = Depends(get_prod_database),
) -> dict[str, str]:
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    album = await engine.find_one(Album, Album.id == album_id)
    if album is None:
        raise HTTPException(status_code=404, detail="Album not found")

    if user.id not in album.participants:
        raise HTTPException(status_code=401, detail="Unauthorized")

    photos = await engine.find(
        AlbumPhoto,
        {
            "album": album.id,
            "timestamp": {
                "$gte": datetime.strptime(f"{fromYear}-W{fromWeek - 1}-1", "%Y-W%W-%w"),
                "$lt": datetime.strptime(f"{toYear}-W{toWeek}-1", "%Y-W%W-%w"),
            },
        },
    )

    response = []
    for photo in photos:
        response.append(
            {
                "photoId": photo.id,
                "url": photo.url,
                "caption": photo.caption,
                "timestamp": photo.timestamp,
                "user": {
                    "id": photo.user.id,
                    "username": photo.user.username,
                    "name": photo.user.name,
                    "iconUrl": photo.user.iconUrl,
                },
            }
        )

    return ORJSONResponse(serialize_mongo_object({"photos": response}))
