from dataclasses import dataclass
from datetime import datetime
from odmantic import Field, Model, AIOEngine, ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId as BsonObjectId

import os

from utils.debug import log_debug
from utils.settings import get_settings


settings = get_settings()
# mongodb is the docker name of the mongodb container
hostname = "mongodb"
if settings.RUN_MODE == "dev":
    hostname = "localhost"
mongodb_connection_string = f"mongodb://{settings.MONGODB_USERNAME}:{settings.MONGODB_PASSWORD}@{hostname}:27017/"
log_debug("Connecting to MongoDB at " + mongodb_connection_string)
client = AsyncIOMotorClient(mongodb_connection_string)
engine = AIOEngine(client=client, database="snappy")


def get_prod_database() -> AIOEngine:
    return engine


def serialize_mongo_object(
    obj: any, project: list[str] = None, exclude: list[str] = None
) -> any:
    if hasattr(obj, "model_dump"):
        obj = obj.model_dump()
    if isinstance(obj, dict):
        if "_id" in obj:
            obj["id"] = obj.pop("_id")
        newobj = {}
        for k, v in obj.items():
            if (project is None or k in project) and (
                exclude is None or k not in exclude
            ):
                newobj[k] = serialize_mongo_object(v, project, exclude)
        obj = newobj
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            obj[i] = serialize_mongo_object(v)
    elif isinstance(obj, datetime):
        obj = obj.isoformat()
    elif isinstance(obj, ObjectId) or isinstance(obj, BsonObjectId):
        obj = str(obj)
    return obj
