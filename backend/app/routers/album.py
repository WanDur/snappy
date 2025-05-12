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


@album_router.post("/create")
async def create_album(
    name: Annotated[str, Form()],
    shared: Annotated[bool, Form()],
    description: Annotated[Optional[str], Form()] = None,
    coverImage: Annotated[Optional[UploadFile], Form()] = None,
    user: User | None = Depends(get_user),
    engine: AIOEngine = Depends(get_prod_database),
) -> dict[str, str]:
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    album = Album(
        name=name,
        shared=shared,
        description=description,
        createdAt=datetime.now(timezone.utc),
        createdBy=user,
    )

    if coverImage:
        if not coverImage.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File is not an image")

        # Optimize and upload the image
        optimized_image = optimize_image(await coverImage.read())
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
        cover_image_url = upload_file_stream(
            f"albums/{album.id}/cover.jpg", optimized_image
        )
        album.coverImageUrl = cover_image_url

    await engine.save(album)

    return ORJSONResponse(
        serialize_mongo_object(
            {
                "albumId": album.id,
                "coverImageUrl": album.coverImageUrl,
                "createdAt": album.createdAt,
            }
        )
    )


class EditAlbumBody(BaseModel):
    name: Optional[str] = None
    shared: Optional[bool] = None
    description: Optional[str] = None


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
    if body.shared:
        album.shared = body.shared
    if body.description:
        album.description = body.description

    await engine.save(album)

    return ORJSONResponse(
        serialize_mongo_object(
            {
                "name": album.name,
                "shared": album.shared,
                "description": album.description,
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

    album_owner = await engine.find_one(User, User.id == album.createdBy)
    if album_owner is None:
        raise HTTPException(status_code=404, detail="Album owner not found")

    if not album.shared or not await Friendship.are_friends(engine, user, album_owner):
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
