from __future__ import annotations
from datetime import datetime, timedelta
from enum import Enum
from typing import Annotated, Optional
from odmantic import Field, Model, ObjectId, Reference
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
    isAdmin: bool = False

    async def is_premium(self) -> bool:
        if self.tier == UserTier.PREMIUM:
            if self.premiumExpireTime and self.premiumExpireTime > datetime.now():
                return True
            else:
                self.tier = UserTier.FREEMIUM
                self.premiumExpireTime = None
                await engine.save(self)
                return False
        else:
            return False

    async def redeemPremium(self, days: int):
        if self.tier == UserTier.FREEMIUM:
            self.tier = UserTier.PREMIUM
            self.premiumExpireTime = datetime.now() + timedelta(days=days)
        else:
            self.premiumExpireTime += timedelta(days=days)
        await engine.save(self)


class Friendship(Model):
    user1: User = Reference()
    user2: User = Reference()
    inviteTimestamp: datetime
    accepted: bool = False

    async def accept(self):
        self.accepted = True
        await engine.save(self)

    @classmethod
    async def get_friendship(cls, user1: User, user2: User) -> Friendship | None:
        friendship = await engine.find_one(
            Friendship,
            (
                (Friendship.user1 == user1.id) & (Friendship.user2 == user2.id)
                | (Friendship.user1 == user2.id) & (Friendship.user2 == user1.id)
            ),
        )
        return friendship

    @classmethod
    async def are_friends(cls, user1: User, user2: User) -> bool:
        fdship = await Friendship.get_friendship(user1, user2)
        if fdship:
            return fdship.accepted
        return False


class License(Model):
    key: str = Field(primary_field=True, unique=True)
    days: int
    redeemed: bool = False
    redeemedAt: Optional[datetime] = None
    redeemedBy: Optional[ObjectId] = None

    @classmethod
    async def get_license(cls, key: str) -> License | None:
        license = await engine.find_one(License, License.key == key)
        return license

    async def redeem(self, user: User):
        self.redeemed = True
        self.redeemedAt = datetime.now()
        self.redeemedBy = user.id
        await user.redeemPremium(self.days)
        await engine.save(self)
