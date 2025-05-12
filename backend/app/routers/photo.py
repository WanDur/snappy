"""
Component for all photos related logics and routes
"""

from datetime import datetime, timezone
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import ORJSONResponse
from odmantic import AIOEngine, ObjectId
from pydantic import BaseModel

from utils.minio import optimize_image, upload_file_stream
from utils.debug import log_debug
from utils.auth import get_user
from utils.mongo import serialize_mongo_object, get_prod_database
from internal.models import Photo, PhotoComment, User

photo_router = APIRouter(prefix="/photo", tags=["photo"])


@photo_router.post("/upload")
async def upload_photo(
    file: UploadFile,
    timestamp: Annotated[Optional[datetime], Form()] = None,
    caption: Annotated[Optional[str], Form()] = None,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
) -> dict[str, str]:
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Check if the file is an image
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File is not an image")

    if not timestamp:
        timestamp = datetime.now(timezone.utc)
    log_debug(f"Received timestamp: {timestamp}")
    # Optimize and upload the image
    optimized_image = optimize_image(await file.read())
    file_path = upload_file_stream(
        f"users/{user.id}/photos/{timestamp.strftime('%Y%m%d%H%M%S')}.jpg",
        optimized_image,
    )

    # Create a new photo object
    photo = Photo(
        user=user,
        caption=caption,
        url=file_path,
        timestamp=timestamp,
    )
    # Save the photo to the database
    await engine.save(photo)

    return ORJSONResponse(
        status_code=200,
        content={"photoId": str(photo.id), "filePath": file_path},
    )


@photo_router.get("/{photo_id}/fetch")
async def fetch_photo(
    photo_id: str, engine: AIOEngine = Depends(get_prod_database)
) -> dict[str, str]:
    # Fetch the photo from the database
    photo = await engine.find_one(Photo, Photo.id == ObjectId(photo_id))
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    # Return the photo URL
    return ORJSONResponse(
        {
            "username": str(photo.user.username),
            "userIconUrl": str(photo.user.iconUrl),
            **serialize_mongo_object(photo, exclude=["user"]),
        }
    )


@photo_router.delete("/{photo_id}/delete")
async def delete_photo(
    photo_id: str,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
) -> dict[str, str]:
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Fetch the photo from the database
    photo = await engine.find_one(Photo, Photo.id == ObjectId(photo_id))
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    # Check if the user is the owner of the photo
    if photo.user.id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Delete the photo from the database
    await engine.delete(photo)

    return ORJSONResponse(status_code=200, content={"success": True})


@photo_router.post("/{photo_id}/like")
async def like_photo(
    photo_id: str,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
) -> dict[str, str]:
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Fetch the photo from the database
    photo = await engine.find_one(Photo, Photo.id == ObjectId(photo_id))
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    # Like the photo
    try:
        await photo.like(engine, user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return ORJSONResponse(status_code=200, content={"success": True})


@photo_router.post("/{photo_id}/unlike")
async def unlike_photo(
    photo_id: str,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
) -> dict[str, str]:
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Fetch the photo from the database
    photo = await engine.find_one(Photo, Photo.id == ObjectId(photo_id))
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    # Unlike the photo
    try:
        await photo.unlike(engine, user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return ORJSONResponse(status_code=200, content={"success": True})


class CommentBody(BaseModel):
    message: str


@photo_router.post("/{photo_id}/comment")
async def comment_photo(
    photo_id: str,
    body: CommentBody,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
) -> dict[str, str]:
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Fetch the photo from the database
    photo = await engine.find_one(Photo, Photo.id == ObjectId(photo_id))
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    # Comment on the photo
    comment = await photo.comment(engine, user, body.message)

    return ORJSONResponse(status_code=200, content={"commentId": str(comment.id)})


@photo_router.get("/{photo_id}/comments")
async def get_comments(
    photo_id: str,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
) -> dict[str, list[dict[str, str]]]:
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Fetch the photo from the database
    photo = await engine.find_one(Photo, Photo.id == ObjectId(photo_id))
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    # Fetch comments for the photo
    comments = await engine.find(PhotoComment, PhotoComment.photo == photo.id)

    return ORJSONResponse(
        status_code=200,
        content={
            "comments": [
                {
                    "userId": str(comment.user.id),
                    "message": comment.message,
                    "timestamp": comment.timestamp,
                }
                for comment in comments
            ]
        },
    )


@photo_router.delete("/comment/{comment_id}/delete")
async def delete_comment(
    comment_id: str,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
) -> dict[str, str]:
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Fetch the comment from the database
    comment = await engine.find_one(
        PhotoComment, PhotoComment.id == ObjectId(comment_id)
    )
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Check if the user is the owner of the comment
    if comment.user.id != user.id or comment.user.id != comment.photo.user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Delete the comment from the database
    await engine.delete(comment)

    return ORJSONResponse(status_code=200, content={"success": True})


@photo_router.get("/feed")
async def get_feed(
    year: int,
    week: int,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
) -> dict[str, list[dict[str, str]]]:
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    if week < 1 or week > 53:
        raise HTTPException(status_code=400, detail="Invalid week number")

    # Fetch the photos uploaded by the user's friends in the specified year & week
    users = await user.get_friends(engine)
    feed = []
    for view_user in users:
        photos = await engine.find(
            Photo,
            {
                "user": view_user.id,
                "timestamp": {
                    "$gte": datetime.strptime(f"{year}-W{week - 1}-1", "%Y-W%W-%w"),
                    "$lt": datetime.strptime(f"{year}-W{week}-1", "%Y-W%W-%w"),
                },
            },
        )
        if photos:
            feed.append(
                {
                    "userId": str(view_user.id),
                    "username": str(view_user.username),
                    "photos": [
                        {
                            "photoId": str(photo.id),
                            "url": str(photo.url),
                            "caption": photo.caption,
                            "location": photo.location,
                            "timestamp": photo.timestamp,
                            "taggedUserIds": photo.taggedUserIds,
                        }
                        for photo in photos
                    ],
                }
            )

    return ORJSONResponse(status_code=200, content=feed)


@photo_router.get("/fetch/{user_id}")
async def fetch_photos(
    user_id: ObjectId,
    fromYear: int,
    fromWeek: int,
    toYear: int,
    toWeek: int,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
) -> dict[str, list[dict[str, str]]]:
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Fetch the photos from the database
    photos = await engine.find(
        Photo,
        {
            "user": user_id,
            "timestamp": {
                "$gte": datetime.strptime(f"{fromYear}-W{fromWeek - 1}-1", "%Y-W%W-%w"),
                "$lt": datetime.strptime(f"{toYear}-W{toWeek}-1", "%Y-W%W-%w"),
            },
        },
    )

    return ORJSONResponse(
        status_code=200,
        content=serialize_mongo_object(
            {
                "photos": [
                    {
                        "id": str(photo.id),
                        "url": str(photo.url),
                        "caption": photo.caption,
                        "location": photo.location,
                        "timestamp": photo.timestamp,
                        "taggedUserIds": photo.taggedUserIds,
                        "likes": await photo.get_likes(engine),
                        "comments": await photo.get_comments(engine),
                    }
                    for photo in photos
                ]
            }
        ),
    )
