from fastapi import FastAPI
import uvicorn

from routers.user import user_router
from routers.auth import auth_router
from routers.license import license_router
from routers.chat import chat_router
from routers.photo import photo_router
from routers.album import album_router
from utils.auth import AuthMiddleware
from utils.minio_server import get_public_file

from urllib.parse import unquote
import os
import sys

# region app

app = FastAPI()
app.add_middleware(
    AuthMiddleware, excluded_routes=["/auth", "/docs", "/openapi.json", "/public"]
)
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(license_router)
app.include_router(chat_router)
app.include_router(photo_router)
app.include_router(album_router)


@app.get("/public/{file_path:path}")
def public_file(file_path: str):
    return get_public_file(unquote(file_path))


# endregion

if __name__ == "__main__":
    reload = "--reload" in sys.argv
    uvicorn.run("main:app", host="0.0.0.0", port=8000, log_level="debug", reload=True)
