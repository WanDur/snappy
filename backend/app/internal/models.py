from __future__ import annotations
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Annotated, Optional
from odmantic import EmbeddedModel, Field, Model, ObjectId, Reference, query
from pydantic import EmailStr, StringConstraints

from utils.mongo import engine
from utils.debug import log_debug

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
    bio: str = ""

    async def is_premium(self) -> bool:
        if self.tier == UserTier.PREMIUM:
            if self.premiumExpireTime and self.premiumExpireTime > datetime.now(
                timezone.utc
            ):
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
            self.premiumExpireTime = datetime.now(timezone.utc) + timedelta(days=days)
        else:
            self.premiumExpireTime += timedelta(days=days)
        await engine.save(self)

    async def get_friends(self) -> list[User]:
        friendships = await engine.find(
            Friendship,
            query.or_(
                (Friendship.user1 == self.id) & (Friendship.accepted == True),
                (Friendship.user2 == self.id) & (Friendship.accepted == True),
            ),
        )
        friends = []
        for friendship in friendships:
            if friendship.user1.id == self.id:
                friends.append(friendship.user2)
            else:
                friends.append(friendship.user1)
        return friends


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

    @classmethod
    async def get_mutual_friends_count(cls, user1: User, user2: User) -> int:
        friends1 = await user1.get_friends()
        friends2 = await user2.get_friends()
        mutual_friends = [friend for friend in friends1 if friend in friends2]
        return len(mutual_friends)


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
        self.redeemedAt = datetime.now(timezone.utc)
        self.redeemedBy = user.id
        await user.redeemPremium(self.days)
        await engine.save(self)


class ConversationType(str, Enum):
    GROUP = "group"
    DIRECT = "direct"


class Conversation(Model):
    type: ConversationType
    createdBy: User = Reference()
    createdAt: datetime
    participants: list[ObjectId] = Field(default_factory=list)
    name: Optional[str] = Field(default=None, min_length=3, max_length=32)

    @classmethod
    async def find_direct_conversation(
        cls, user1: User, user2: User
    ) -> Conversation | None:
        conversation = await engine.get_collection(Conversation).find_one(
            {
                "type": ConversationType.DIRECT,
                "participants": {
                    "$all": [user1.id, user2.id],
                },
            }
        )
        return conversation

    @classmethod
    async def find_conversation_ids(cls, user: User) -> list[ObjectId]:
        convo_dicts = (
            await engine.get_collection(Conversation)
            .find(
                {
                    "participants": {
                        "$all": [user.id],
                    },
                }
            )
            .to_list()
        )

        return [convo["_id"] for convo in convo_dicts]

    async def get_last_message_time(self) -> datetime:
        messages = await engine.find(Message, Message.conversation == self.id)
        if messages:
            return max(messages, key=lambda x: x.timestamp).timestamp
        return self.createdAt


class AttachmentType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"


class Attachment(EmbeddedModel):
    type: AttachmentType
    name: str
    url: str


class Message(Model):
    conversation: Conversation = Reference()
    sender: User = Reference()
    message: str
    timestamp: datetime
    attachments: list[Attachment] = Field(default_factory=list)


class Photo(Model):
    user: User = Reference()
    timestamp: datetime
    url: str
    caption: Optional[str] = None
    taggedUserIds: list[ObjectId] = Field(default_factory=list)

    async def like(self, user: User):
        like = await engine.find_one(
            PhotoLike, query.and_(PhotoLike.user == user.id, PhotoLike.photo == self.id)
        )
        if like:
            raise Exception("Already liked")
        like = PhotoLike(user=user, photo=self)
        await engine.save(like)

    async def unlike(self, user: User):
        like = await engine.find_one(
            PhotoLike, query.and_(PhotoLike.user == user.id, PhotoLike.photo == self.id)
        )
        if like:
            await engine.delete(like)
        else:
            raise Exception("Not liked yet")

    async def comment(self, user: User, message: str):
        comment = PhotoComment(
            user=user, photo=self, timestamp=datetime.now(timezone.utc), message=message
        )
        await engine.save(comment)


class PhotoLike(Model):
    user: User = Reference()
    photo: Photo = Reference()


class PhotoComment(Model):
    user: User = Reference()
    photo: Photo = Reference()
    timestamp: datetime
    message: str


class Album(Model):
    name: str
    participants: list[ObjectId]
    createdAt: datetime
    createdBy: User = Reference()
    photos: list[ObjectId] = Field(default_factory=list)


class AlbumPhoto(Model):
    album: Album = Reference()
    user: User = Reference()
    timestamp: datetime
    url: str
    caption: Optional[str] = None
    taggedUserIds: list[ObjectId] = Field(default_factory=list)
