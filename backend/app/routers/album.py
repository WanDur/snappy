"""
Component for all albums related logics and routes
"""

from datetime import datetime, timezone
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile
from fastapi.responses import ORJSONResponse
from odmantic import AIOEngine, ObjectId
from pydantic import BaseModel

from utils.settings import get_settings
from utils.minio import optimize_image, upload_file_stream
from utils.debug import log_debug
from utils.auth import get_user
from utils.mongo import serialize_mongo_object, get_prod_database
from internal.models import Album, AlbumPhoto, Friendship, User, UserTier

album_router = APIRouter(prefix="/album", tags=["album"])


@album_router.post("/create")
async def create_album(
    name: Annotated[str, Form()],
    shared: Annotated[bool, Form()],
    participants: Annotated[Optional[list[ObjectId]], Form()] = None,
    description: Annotated[Optional[str], Form()] = None,
    coverImage: Annotated[Optional[UploadFile], Form()] = None,
    user: User | None = Depends(get_user),
    engine: AIOEngine = Depends(get_prod_database),
) -> dict[str, str]:
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if (
        user.tier == UserTier.FREEMIUM
        and len(await engine.find(Album, Album.createdBy == user.id))
        >= get_settings().ALBUM_FREEMIUM_LIMIT
    ):
        raise HTTPException(
            status_code=400,
            detail="You have reached the maximum number of albums for your plan",
        )

    if shared:
        # Check that every participant is a friend of the user
        if participants:
            for participant_id in participants:
                if participant_id == user.id:
                    continue
                participant = await engine.find_one(User, User.id == participant_id)
                if not await Friendship.are_friends(engine, user, participant):
                    raise HTTPException(
                        status_code=400,
                        detail=f"You are not friends with @{participant.username}",
                    )
        else:  # Check that particiapnts are provided for shared albums
            raise HTTPException(
                status_code=400, detail="Participants are required for shared albums"
            )
    else:
        # Check that participants are not provided for non-shared albums
        if participants:
            raise HTTPException(
                status_code=400,
                detail="Participants are not allowed for non-shared albums",
            )

    album = Album(
        name=name,
        shared=shared,
        participants=participants,
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
    if body.shared:
        album.shared = body.shared
    if body.description:
        album.description = body.description
    if body.participants:
        album.participants = body.participants

    await engine.save(album)

    return ORJSONResponse(
        serialize_mongo_object(
            {
                "name": album.name,
                "shared": album.shared,
                "description": album.description,
                "createdAt": album.createdAt,
                "participants": album.participants,
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

    if not await album.can_access(engine, user):
        raise HTTPException(status_code=401, detail="Unauthorized")

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

    album_owner = await engine.find_one(User, User.id == album.createdBy.id)
    if album_owner is None:
        raise HTTPException(status_code=404, detail="Album owner not found")

    if not await album.can_access(engine, user):
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


@album_router.delete("/{album_id}/delete")
async def delete_album(
    album_id: ObjectId,
    user: User | None = Depends(get_user),
    engine: AIOEngine = Depends(get_prod_database),
) -> dict[str, str]:
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    album = await engine.find_one(Album, Album.id == album_id)
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")

    if album.createdBy != user:
        raise HTTPException(
            status_code=401, detail="You are not the owner of this album"
        )

    album_photos = await engine.find(AlbumPhoto, AlbumPhoto.album == album_id)
    for photo in album_photos:
        await engine.delete(photo)

    await engine.delete(album)

    return ORJSONResponse(serialize_mongo_object({"status": "success"}))


@album_router.get("/fetch")
async def fetch_albums(
    user: User | None = Depends(get_user),
    engine: AIOEngine = Depends(get_prod_database),
) -> dict[str, str]:
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    shared_albums = await Album.get_user_accessible_albums(engine, user)
    own_albums = await engine.find(Album, Album.createdBy == user.id)

    async def get_album_info(album: Album) -> dict[str, str]:
        info = {
            "id": album.id,
            "name": album.name,
            "shared": album.shared,
            "createdAt": album.createdAt,
            "createdBy": album.createdBy.id,
            "coverImage": album.coverImageUrl,
            "description": album.description,
        }
        if album.shared:
            info["participants"] = album.participants
        photos = await engine.find(AlbumPhoto, AlbumPhoto.album == album.id)
        info["photos"] = [{"id": photo.id, "url": photo.url} for photo in photos]
        if not info["photos"]:
            info["photos"] = []
        return info

    return ORJSONResponse(
        serialize_mongo_object(
            {
                "sharedAlbums": [
                    await get_album_info(album) for album in shared_albums
                ],
                "ownAlbums": [await get_album_info(album) for album in own_albums],
            }
        )
    )
