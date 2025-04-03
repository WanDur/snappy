from dataclasses import dataclass
from datetime import datetime
from odmantic import Field, Model, AIOEngine, ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId as BsonObjectId

import os

from utils.debug import log_debug
from utils.settings import get_settings


settings = get_settings()
mongodb_connection_string = f"mongodb://{settings.MONGODB_USERNAME}:{settings.MONGODB_PASSWORD}@localhost:27017/"
log_debug(mongodb_connection_string)
client = AsyncIOMotorClient(mongodb_connection_string)
engine = AIOEngine(client=client, database="snappy")


def serialize_mongo_object(obj: any, project: list[str] = []):
    if hasattr(obj, "model_dump"):
        obj = obj.model_dump()
    if isinstance(obj, dict):
        if "_id" in obj:
            obj["id"] = obj.pop("_id")
        newobj = {}
        for k, v in obj.items():
            if k in project or project == []:
                newobj[k] = serialize_mongo_object(v)
        obj = newobj
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            obj[i] = serialize_mongo_object(v)
    elif isinstance(obj, datetime):
        obj = obj.isoformat()
    elif isinstance(obj, ObjectId) or isinstance(obj, BsonObjectId):
        obj = str(obj)
    return obj
