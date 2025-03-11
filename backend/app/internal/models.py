from datetime import datetime, timedelta
from enum import Enum
from typing import Annotated, Optional
from odmantic import Field, Model
from pydantic import EmailStr, StringConstraints

from utils.mongo import engine

# section user


class UserTier(str, Enum):
    FREEMIUM = "freemium"
    PREMIUM = "premium"


class User(Model):
    email: EmailStr
    bcryptPassword: str
    username: str = Field(min_length=3, max_length=32)
    name: str
    phone: Annotated[str, StringConstraints(pattern=r"^\(\+\d{1,3}\) \d{3,15}$")]
    iconUrl: Optional[str] = None
    notificationTokens: list[str] = []
    tier: UserTier = UserTier.FREEMIUM
    premiumExpireTime: Optional[datetime] = None

    def redeemPremium(self, days: int):
        self.tier = UserTier.PREMIUM
        self.premiumExpireTime = datetime.now() + timedelta(days=days)
        engine.save(self)
