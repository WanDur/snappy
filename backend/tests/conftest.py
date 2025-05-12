from datetime import datetime, timezone
import os
import dotenv

dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), "../app/.env"))

import bcrypt
from faker import Faker
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from odmantic import AIOEngine
from motor.motor_asyncio import AsyncIOMotorClient


from main import app
from utils.auth import access_auth, get_user
from utils.settings import get_settings
from internal.models import User, UserTier, Friendship
from utils.mongo import get_prod_database

faker = Faker()


def get_test_database():
    client = AsyncIOMotorClient(
        f"mongodb://{get_settings().MONGODB_USERNAME}:{get_settings().MONGODB_PASSWORD}@localhost:27017/"
    )
    engine = AIOEngine(client=client, database="snappy_test")
    return client, engine


async def get_user_token(client, username, password):
    res = await client.post(
        "/auth/login",
        json={"emailUsernamePhone": username, "password": password},
    )
    return res.json()["accessToken"]


async def add_random_user(
    mongodb,
    username: str = None,
    tier: UserTier = UserTier.FREEMIUM,
    friend_with: User | None = None,
    count: int = 1,
):
    users, passwords = zip(*[generate_user_data(username, tier) for _ in range(count)])
    users, passwords = list(users), list(passwords)

    await mongodb.save_all(users)
    if friend_with:
        for user in users:
            friendship = Friendship(
                user1=friend_with,
                user2=user,
                accepted=True,
                inviteTimestamp=datetime.now(timezone.utc),
            )
            await mongodb.save(friendship)
    if count == 1:
        return users[0], passwords[0]
    return users, passwords


@pytest_asyncio.fixture(scope="function")
async def mongodb():
    """Fixture to set up a mock MongoDB instance."""
    client, engine = get_test_database()
    app.dependency_overrides[get_prod_database] = lambda: engine
    yield engine
    await client.drop_database("snappy_test")


@pytest_asyncio.fixture(scope="function")
async def client(mongodb):
    """Fixture to set up the FastAPI test client."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client


def generate_user_data(
    username: str = None, tier: UserTier = UserTier.FREEMIUM
) -> tuple[User, str]:
    password = faker.password().encode("utf-8")
    return (
        User(
            username=faker.user_name() if username is None else username,
            bcryptPassword=bcrypt.hashpw(password, bcrypt.gensalt()),
            name=faker.name(),
            email=faker.email(),
            phone=f"(+852) {faker.random_number(digits=8)}",
            tier=tier,
            premiumExpireTime=(
                faker.date_time_this_year(after_now=True) if tier == "premium" else None
            ),
        ),
        password.decode("utf-8"),
    )


@pytest_asyncio.fixture(scope="function")
async def sample_freemium_user(mongodb):
    user, _ = generate_user_data("freemium")
    await mongodb.save(user)
    token = access_auth.create_access_token(
        {"id": str(user.id), "username": user.username}
    )
    app.dependency_overrides[get_user] = lambda: user
    yield user, token
    await mongodb.delete(user)


@pytest_asyncio.fixture(scope="function")
async def sample_premium_user(mongodb):
    user, _ = generate_user_data("premium")
    await mongodb.save(user)
    token = access_auth.create_access_token(
        {"id": str(user.id), "username": user.username}
    )
    app.dependency_overrides[get_user] = lambda: user
    yield user, token
    await mongodb.delete(user)
