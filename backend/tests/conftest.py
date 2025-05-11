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
from internal.models import User, UserTier
from utils.mongo import get_prod_database

faker = Faker()


def get_test_database():
    client = AsyncIOMotorClient(
        f"mongodb://{get_settings().MONGODB_USERNAME}:{get_settings().MONGODB_PASSWORD}@localhost:27017/"
    )
    engine = AIOEngine(client=client, database="snappy_test")
    return client, engine


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


def generate_user_data(tier: UserTier = UserTier.FREEMIUM) -> User:
    return User(
        username=faker.user_name(),
        bcryptPassword=bcrypt.hashpw(
            faker.password().encode("utf-8"), bcrypt.gensalt()
        ),
        name=faker.name(),
        email=faker.email(),
        phone=f"(+852) {faker.random_number(digits=8)}",
        tier=tier,
        premiumExpireTime=(
            faker.date_time_this_year(after_now=True) if tier == "premium" else None
        ),
    )


@pytest_asyncio.fixture(scope="function")
async def sample_freemium_user(mongodb):
    user = generate_user_data("freemium")
    await mongodb.save(user)
    token = access_auth.create_access_token(
        {"id": str(user.id), "username": user.username}
    )
    app.dependency_overrides[get_user] = lambda: user
    yield user, token
    await mongodb.delete(user)


@pytest_asyncio.fixture(scope="function")
async def sample_premium_user(mongodb):
    user = generate_user_data("premium")
    await mongodb.save(user)
    token = access_auth.create_access_token(
        {"id": str(user.id), "username": user.username}
    )
    app.dependency_overrides[get_user] = lambda: user
    yield user, token
    await mongodb.delete(user)
