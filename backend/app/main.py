from fastapi import FastAPI
import uvicorn

from routers.user import user_router
from routers.auth import auth_router, AuthMiddleware
from utils.minio import get_public_file

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


@app.get("/public/{file_path}")
def public_file(file_path: str):
    return get_public_file(unquote(file_path))


# endregion

if __name__ == "__main__":
    reload = "--reload" in sys.argv
    uvicorn.run("main:app", log_level="debug", reload=True)
