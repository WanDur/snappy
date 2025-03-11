

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  authjwt_secret_key: str
  access_token_expire_time: int
  refresh_token_expire_time: int

  mongodb_username: str
  mongodb_password: str

  model_config = SettingsConfigDict(env_file='.env')

@lru_cache
def get_settings():
  return Settings()