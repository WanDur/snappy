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

from enum import Enum
from typing import Annotated, Optional
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.responses import ORJSONResponse
from fastapi_jwt import JwtAuthorizationCredentials
from odmantic import ObjectId
from pydantic import BaseModel, StringConstraints

from utils.debug import log_debug
from routers.auth import get_user, access_auth
from utils.mongo import engine, serialize_mongo_object
from internal.models import User, UserTier

# region routes

user_router = APIRouter(prefix="/user", tags=["user"])


class UserFetchProfileResponse(BaseModel):
    id: ObjectId
    username: str
    name: str
    iconUrl: Optional[str]
    tier: UserTier


@user_router.get("/profile/fetch/{user_id}")
async def fetch_user_profile(user_id: str) -> UserFetchProfileResponse:
    user = await engine.find_one(User, User.id == ObjectId(user_id))
    if not user:
        return HTTPException(status_code=400, detail="User not found")
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


@user_router.post("/profile/edit")
async def edit_user_profile(body: UserEditProfileBody, user: User = Depends(get_user)):
    if not user:
        return HTTPException(status_code=401, detail="Unauthorized")
    for k, v in body.model_dump().items():
        if v:
            if k == "password":
                user.bcryptPassword = bcrypt.hashpw(
                    body.password.encode("utf-8"), bcrypt.gensalt()
                ).decode("utf-8")
            user.__setattr__(k, v)
    await engine.save(user)
    return HTTPException(status_code=200, detail="Profile updated")
