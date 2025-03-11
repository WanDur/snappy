'''
Component for all user related logics and routes
'''

if __name__ == "__main__":
  import os
  import sys
  _proj_path = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
  print(_proj_path)
  sys.path.append(_proj_path)
  __package__ = 'routers.user'

from enum import Enum
from typing import Optional
from fastapi import APIRouter, HTTPException
from fastapi.responses import ORJSONResponse
from odmantic import Model, ObjectId
from datetime import datetime, timedelta
from utils.mongo import engine, serialize_mongo_object

# region Model

class UserTier(str, Enum):
  FREEMIUM = "freemium"
  PREMIUM = "premium"

class User(Model):
  email: str
  bcryptPassword: str
  username: str
  name: str
  phone: str
  iconUrl: Optional[str] = None
  notificationTokens: list[str] = []
  tier: UserTier = UserTier.FREEMIUM
  premiumExpireTime: Optional[datetime] = None

  def redeemPremium(self, days: int):
    self.tier = UserTier.PREMIUM
    self.premiumExpireTime = datetime.now() + timedelta(days = days)
    engine.save(self)

# endregion

# region routes

user_router = APIRouter(prefix='/user', tags=['user'])

@user_router.get('/profile/{user_id}')
async def test(user_id: str):
  user = await engine.find_one(User, User.id == ObjectId(user_id))
  if not user:
    return HTTPException(status_code=400, detail="User not found")
  return ORJSONResponse(serialize_mongo_object(user))