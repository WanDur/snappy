from fastapi import FastAPI
import uvicorn

from routers.user import user_router
from routers.auth import auth_router, AuthMiddleware

import os
import sys

# region app

app = FastAPI()
app.add_middleware(AuthMiddleware, excluded_routes=["/auth", "/docs", "/openapi.json"])
app.include_router(auth_router)
app.include_router(user_router)


# endregion

if __name__ == "__main__":
    reload = "--reload" in sys.argv
    uvicorn.run("main:app", log_level="debug", reload=True)
