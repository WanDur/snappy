import time
from bson import ObjectId
from fastapi import Security
from fastapi.params import Depends
from fastapi.responses import ORJSONResponse
from odmantic import AIOEngine
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import timedelta
from fastapi_jwt import JwtAccessBearer, JwtAuthorizationCredentials, JwtRefreshBearer

from internal.models import User
from utils.settings import get_settings
from utils.mongo import engine, get_prod_database
from utils.debug import log_debug


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
            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return ORJSONResponse(
                    status_code=401, content={"detail": "Unauthorized"}
                )

            token = auth_header.split("Bearer ")[1]
            payload = access_auth.jwt_backend.decode(
                token,
                access_auth.secret_key,
            )

            if payload["exp"] < time.time():
                print(
                    f"Token expired. Exp: {payload['exp']}, Current: {time.time()}"
                )  # Debug log
                return ORJSONResponse(
                    status_code=401, content={"detail": "Token expired"}
                )
        except Exception as e:
            print(f"Auth error: {str(e)}")  # Debug log
            return ORJSONResponse(status_code=401, content={"detail": "Unauthorized"})

        response = await call_next(request)
        return response


async def get_user(
    credentials: JwtAuthorizationCredentials = Security(access_auth),
    engine: AIOEngine = Depends(get_prod_database),
) -> User | None:
    return await engine.find_one(User, User.id == ObjectId(credentials.subject["id"]))


async def get_user_from_token(engine: AIOEngine, token: str) -> User | None:
    payload = access_auth.jwt_backend.decode(
        token,
        access_auth.secret_key,
    )
    return await engine.find_one(User, User.id == ObjectId(payload["subject"]["id"]))
