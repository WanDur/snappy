from functools import lru_cache
from re import S
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    RUN_MODE: str

    AUTHJWT_SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_TIME: int
    REFRESH_TOKEN_EXPIRE_TIME: int

    MONGODB_USERNAME: str
    MONGODB_PASSWORD: str

    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MAX_UPLOAD_SIZE: int

    AES_SECRET_KEY: str
    AES_KEY_SIZE: int
    AES_CONTAINED_SECRET_KEY: str
    AES_SALT_SIZE: int
    AES_NONCE_SIZE: int
    AES_TAG_SIZE: int

    model_config = SettingsConfigDict(env_file=".env")


@lru_cache
def get_settings():
    return Settings()
