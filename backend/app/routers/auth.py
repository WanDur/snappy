"""
Component for all authentication related logics and routes
"""

from datetime import timedelta
import math
import os
import time

from odmantic import ObjectId

if __name__ == "__main__":
    import sys

    _proj_path = os.path.abspath(
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
    )
    print(_proj_path)
    sys.path.append(_proj_path)
    __package__ = "routers.auth"

from fastapi import APIRouter, HTTPException, Security
from fastapi.responses import ORJSONResponse
from fastapi_jwt import JwtAccessBearer, JwtAuthorizationCredentials, JwtRefreshBearer
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel
import bcrypt

from utils.settings import get_settings
from utils.mongo import engine
from utils.debug import log_debug
from internal.models import User

settings = get_settings()

# region authjwt

ACCESS_EXPIRE_TIME = settings.ACCESS_TOKEN_EXPIRE_TIME
REFRESH_EXPIRE_TIME = settings.REFRESH_TOKEN_EXPIRE_TIME
access_auth = JwtAccessBearer(
    secret_key=settings.AUTHJWT_SECRET_KEY,
    auto_error=True,
    access_expires_delta=timedelta(seconds=ACCESS_EXPIRE_TIME),
    refresh_expires_delta=timedelta(seconds=REFRESH_EXPIRE_TIME),
)
refresh_auth = JwtRefreshBearer.from_other(access_auth)


class AuthMiddleware(BaseHTTPMiddleware):
    """
    This middleware protects all routes except `/auth`
    """

    def __init__(self, app, excluded_routes: list[str] = []):
        super().__init__(app)
        self.excluded_routes = excluded_routes

    async def dispatch(self, request, call_next):
        for excluded_route in self.excluded_routes:
            if request.url.path.startswith(excluded_route):
                return await call_next(request)

        try:
            payload = access_auth.jwt_backend.decode(
                request.headers["Authorization"].split("Bearer ")[1],
                access_auth.secret_key,
            )
            if payload["exp"] < time.time():
                return ORJSONResponse(
                    status_code=401, content={"detail": "Token expired"}
                )
        except:
            return ORJSONResponse(status_code=401, content={"detail": "Unauthorized"})

        response = await call_next(request)
        return response


async def get_user(
    sub: JwtAuthorizationCredentials = Security(access_auth),
) -> User | None:
    return await engine.find_one(User, User.id == ObjectId(sub["id"]))


# endregion

# region routes

auth_router = APIRouter(prefix="/auth", tags=["auth"])


class AuthLoginBody(BaseModel):
    emailUsernamePhone: str
    password: str


class AuthLoginResponse(BaseModel):
    access_token: str
    access_token_expire_time: int
    refresh_token: str
    refresh_token_expire_time: int


@auth_router.post("/login")
async def user_login(body: AuthLoginBody) -> AuthLoginResponse:
    user = await engine.find_one(
        User,
        (User.email == body.emailUsernamePhone)
        | (User.username == body.emailUsernamePhone)
        | (User.phone == body.emailUsernamePhone),
    )
    if user and bcrypt.checkpw(
        body.password.encode("utf-8"), user.bcryptPassword.encode("utf-8")
    ):
        sub = {"id": str(user.id), "username": user.username}
        access_token = access_auth.create_access_token(subject=sub)
        refresh_token = refresh_auth.create_refresh_token(subject=sub)
        return ORJSONResponse(
            {
                "access_token": access_token,
                "access_token_expire_time": math.floor(time.time())
                + ACCESS_EXPIRE_TIME,
                "refresh_token": refresh_token,
                "refresh_token_expire_time": math.floor(time.time())
                + REFRESH_EXPIRE_TIME,
            }
        )
    raise HTTPException(status_code=401, detail="Invalid credentials")


class AuthRegisterBody(BaseModel):
    email: str
    password: str
    username: str
    name: str
    phone: str


class AuthRegisterResponse(BaseModel):
    success: bool = True


@auth_router.post("/register")
async def user_register(body: AuthRegisterBody) -> AuthRegisterResponse:
    """
    This route is used for registering new accounts.
    It checks for any duplicated email / username / phone.
    """
    duplicated_fields = []
    if await engine.count(User, User.email == body.email):
        duplicated_fields.append("email")
    if await engine.count(User, User.username == body.username):
        duplicated_fields.append("username")
    if await engine.count(User, User.phone == body.phone):
        duplicated_fields.append("phone")
    if len(duplicated_fields) > 0:
        return ORJSONResponse(
            status_code=409,
            content={"detail": "User already exists", "loc": duplicated_fields},
        )

    user = User(
        email=body.email,
        bcryptPassword=bcrypt.hashpw(
            body.password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8"),
        username=body.username,
        name=body.name,
        phone=body.phone,
    )

    await engine.save(user)
    return ORJSONResponse({"success": True})


class AuthRefreshTokenResponse(BaseModel):
    access_token: str
    access_token_expire_time: int


@auth_router.post("/token/refresh")
async def refresh_token(
    cred: JwtAuthorizationCredentials = Security(refresh_auth),
) -> AuthRefreshTokenResponse:
    """
    This route is used for clients to obtain new access tokens based on previously obtained refresh tokens.
    The refresh bearer token should be placed in the `Authorization` header of the request.
    """
    access_token = access_auth.create_access_token(subject=cred.subject)
    return ORJSONResponse(
        {
            "access_token": access_token,
            "access_token_expire_time": math.floor(time.time()) + ACCESS_EXPIRE_TIME,
        }
    )


# endregion
