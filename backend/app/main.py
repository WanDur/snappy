from functools import lru_cache
from fastapi import FastAPI, Request
from fastapi.responses import ORJSONResponse
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict
import uvicorn

from utils.settings import get_settings
from routers.user import user_router
from routers.auth import auth_router, AuthMiddleware

import os
import sys

# region app

app = FastAPI()
app.add_middleware(AuthMiddleware, excluded_routes=['/auth', '/docs', '/openapi.json'])
app.include_router(auth_router)
app.include_router(user_router)



# endregion

if __name__ == '__main__':
  reload = '--reload' in sys.argv
  uvicorn.run('main:app', log_level='debug', reload=True)
