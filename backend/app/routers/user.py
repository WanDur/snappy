"""
Component for all user related logics and routes
"""

if __name__ == "__main__":
    import os
    import sys

    _proj_path = os.path.abspath(
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
    )
    print(_proj_path)
    sys.path.append(_proj_path)
    __package__ = "routers.user"

from datetime import datetime, timezone
from enum import Enum
from typing import Annotated, Optional
import bcrypt
from fastapi import APIRouter, Depends, File, HTTPException, Security
from fastapi.responses import ORJSONResponse
from fastapi_jwt import JwtAuthorizationCredentials
from odmantic import AIOEngine, ObjectId
from pydantic import BaseModel, StringConstraints

from utils.minio_server import optimize_image, upload_file_stream
from utils.debug import log_debug
from utils.auth import get_user
from utils.mongo import serialize_mongo_object, get_prod_database
from internal.models import AlbumPhoto, Friendship, User, UserTier, Photo, Album

# region routes

user_router = APIRouter(prefix="/user", tags=["user"])


class UserFetchProfileResponse(BaseModel):
    id: ObjectId
    username: str
    name: str
    iconUrl: Optional[str]
    tier: UserTier


@user_router.get("/profile/myself")
async def fetch_my_profile(
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
):
    if not user:
        return HTTPException(status_code=401, detail="Unauthorized")
    response = serialize_mongo_object(
        user,
        project=[
            "id",
            "username",
            "name",
            "email",
            "phone",
            "iconUrl",
            "tier",
            "premiumExpireTime",
            "bio",
        ],
    )
    response["photoCount"] = 0  # TODO: count photos of users
    response["lastLocation"] = "Universe"
    return ORJSONResponse(response)


@user_router.get("/profile/fetch/{user_id}")
async def fetch_user_profile(
    user_id: str,
    detail: bool = False,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
) -> UserFetchProfileResponse:
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    target_user = await engine.find_one(User, User.id == ObjectId(user_id))
    if not target_user:
        raise HTTPException(status_code=400, detail="User not found")
    if detail:
        mutual_friends = await Friendship.get_mutual_friends_count(
            engine, user, target_user
        )
        posts_count = await engine.count(Photo, Photo.user == target_user.id)
        friends_count = await engine.count(
            Friendship,
            (Friendship.user1 == target_user.id)
            | (Friendship.user2 == target_user.id) & (Friendship.accepted == True),
        )
        albums_count = await engine.count(Album, Album.createdBy == target_user.id)
        recent_photos = await engine.find(
            Photo,
            Photo.user == target_user.id,
            limit=6,
            sort=Photo.timestamp.desc(),
        )
        shared_albums = await engine.find(
            Album,
            Album.createdBy == target_user.id,
            Album.shared == True,
        )

        async def get_album_info(album: Album) -> dict:
            album_photos = await engine.find(AlbumPhoto, AlbumPhoto.album == album.id)
            return {
                **serialize_mongo_object(album, project=["id", "name"]),
                "count": len(album_photos),
                "coverUrl": album_photos[0].url if album_photos else None,
            }

        return ORJSONResponse(
            {
                **serialize_mongo_object(
                    target_user,
                    project=["id", "username", "bio", "name", "iconUrl", "tier"],
                ),
                "friendStatus": await Friendship.get_friend_status(
                    engine, user, target_user
                ),
                "mutualFriends": mutual_friends,
                "postsCount": posts_count,
                "friendsCount": friends_count,
                "albumsCount": albums_count,
                "recentPhotos": [
                    serialize_mongo_object(photo, project=["id", "url", "timestamp"])
                    for photo in recent_photos
                ],
                "sharedAlbums": [
                    await get_album_info(album) for album in shared_albums
                ],
            }
        )

    return ORJSONResponse(
        serialize_mongo_object(
            user, project=["id", "username", "name", "iconUrl", "tier"]
        )
    )


class UserEditProfileBody(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    username: Optional[
        Annotated[str, StringConstraints(min_length=3, max_length=32)]
    ] = None
    name: Optional[str] = None
    phone: Optional[
        Annotated[str, StringConstraints(pattern=r"^\(\+\d{1,3}\) \d{3,15}$")]
    ] = None
    bio: Optional[str] = None


@user_router.post("/profile/edit")
async def edit_user_profile(
    body: UserEditProfileBody,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
):
    if not user:
        return HTTPException(status_code=401, detail="Unauthorized")
    for k, v in body.model_dump().items():
        if v:
            if k == "password":
                user.bcryptPassword = bcrypt.hashpw(
                    body.password.encode("utf-8"), bcrypt.gensalt()
                ).decode("utf-8")
            else:
                user.__setattr__(k, v)
    await engine.save(user)
    return ORJSONResponse({"status": "success"})


@user_router.post("/profile/icon/upload")
async def upload_user_icon(
    file: Annotated[bytes, File()],
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
):
    if not user:
        return HTTPException(status_code=401, detail="Unauthorized")
    optimized_img = optimize_image(file)  # also performed checks here
    file_public_path = upload_file_stream(f"users/{user.id}/icon.jpg", optimized_img)
    user.iconUrl = file_public_path
    await engine.save(user)
    return ORJSONResponse({"status": "success", "filePath": file_public_path})


@user_router.delete("/profile/icon/remove")
async def remove_user_icon(
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
):
    if not user:
        return HTTPException(status_code=401, detail="Unauthorized")
    if not user.iconUrl:
        return HTTPException(status_code=400, detail="Icon not found")

    user.iconUrl = None
    await engine.save(user)
    return ORJSONResponse({"status": "success"})


# region friendship


@user_router.get("/search")
async def search_user(
    query: str,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
):
    if not user:
        return HTTPException(status_code=401, detail="Unauthorized")
    if len(query) < 3:
        return ORJSONResponse(
            {
                "status": "success",
                "users": [],
            }
        )
    if query == "":
        return ORJSONResponse(
            {
                "status": "success",
                "users": [],
            }
        )
    query_users = await engine.find(
        User,
        {
            "username": {"$regex": query, "$options": "i"},
        },
    )
    responseUsers = []
    for query_user in query_users:
        if user.id != query_user.id:
            friend_status = await Friendship.get_friend_status(engine, user, query_user)
            responseUsers.append(
                {
                    "friendStatus": friend_status,
                    **serialize_mongo_object(
                        query_user, project=["username", "name", "iconUrl", "id"]
                    ),
                }
            )
    return ORJSONResponse(
        {
            "status": "success",
            "users": responseUsers,
        }
    )


@user_router.post("/friends/invite/{target_user_id}")
async def invite_friend(
    target_user_id: str,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
):
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    target_user = await engine.find_one(User, User.id == ObjectId(target_user_id))
    if not target_user:
        raise HTTPException(status_code=400, detail="Target user not found")
    if target_user.id == user.id:
        raise HTTPException(status_code=400, detail="Cannot invite yourself")
    existing_friendship = await Friendship.get_friendship(engine, user, target_user)
    if existing_friendship:
        if existing_friendship.accepted:
            raise HTTPException(status_code=400, detail="Already friends")
        else:
            raise HTTPException(status_code=400, detail="Already invited")
    friendship = Friendship(
        user1=user, user2=target_user, inviteTimestamp=datetime.now(timezone.utc)
    )
    await engine.save(friendship)
    return ORJSONResponse({"status": "success"})


@user_router.post("/friends/accept/{target_user_id}")
async def accept_friend(
    target_user_id: str,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
):
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    target_user = await engine.find_one(User, User.id == ObjectId(target_user_id))
    if not target_user:
        raise HTTPException(status_code=400, detail="Target user not found")
    friendship = await Friendship.get_friendship(engine, user, target_user)
    if not friendship:
        raise HTTPException(status_code=400, detail="Invitation not found")
    if friendship.accepted:
        raise HTTPException(status_code=400, detail="Already friends")
    if friendship.user1 == user:
        raise HTTPException(
            status_code=400, detail="Cannot accept invitation of yourself"
        )
    await friendship.accept(engine)
    return ORJSONResponse({"status": "success"})


@user_router.post("/friends/remove/{target_user_id}")
async def remove_friend(
    target_user_id: str,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
):
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    target_user = await engine.find_one(User, User.id == ObjectId(target_user_id))
    if not target_user:
        raise HTTPException(status_code=400, detail="Target user not found")
    friendship = await Friendship.get_friendship(engine, user, target_user)
    if not friendship:
        raise HTTPException(status_code=400, detail="Not friends")
    await engine.delete(friendship)
    return ORJSONResponse({"status": "success"})


@user_router.get("/friends/list")
async def list_friends(
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
):
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    log_debug(user.id)
    friendships = await engine.find(
        Friendship, (Friendship.user1 == user.id) | (Friendship.user2 == user.id)
    )
    friends = []
    incoming_invitations = []
    outgoing_invitations = []
    for friendship in friendships:
        if friendship.accepted:
            friends.append(
                friendship.user2 if friendship.user1.id == user.id else friendship.user1
            )
        else:
            if friendship.user1 == user:
                outgoing_invitations.append(friendship.user2)
            else:
                incoming_invitations.append(friendship.user1)
    return ORJSONResponse(
        {
            "status": "success",
            "friends": [
                serialize_mongo_object(friend, ["username", "name", "iconUrl", "id"])
                for friend in friends
            ],
            "incomingInvitations": [
                serialize_mongo_object(
                    invitation, ["username", "name", "iconUrl", "id"]
                )
                for invitation in incoming_invitations
            ],
            "outgoingInvitations": [
                serialize_mongo_object(
                    invitation, ["username", "name", "iconUrl", "id"]
                )
                for invitation in outgoing_invitations
            ],
        }
    )


@user_router.get("/friends/suggested")
async def get_suggested_friends(
    limit: int = 10,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
):
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    suggested_friends = await engine.find(User, User.id != user.id, limit=100)
    result = []
    for suggested_friend in suggested_friends:
        if await Friendship.are_friends(engine, user, suggested_friend):
            continue
        mutual_friends_count = await Friendship.get_mutual_friends_count(
            engine, user, suggested_friend
        )
        result.append((mutual_friends_count, suggested_friend))
    result.sort(key=lambda x: x[0], reverse=True)
    return ORJSONResponse(
        {
            "status": "success",
            "suggestedFriends": [
                {
                    **serialize_mongo_object(
                        result[i][1], ["username", "name", "iconUrl", "id"]
                    ),
                    "mutualFriends": result[i][0],
                }
                for i in range(min(len(result), limit))
            ],
        }
    )
