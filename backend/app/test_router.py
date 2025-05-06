import asyncio
import bcrypt
from httpx import ASGITransport, AsyncClient
import pytest
from faker import Faker
from fastapi.testclient import TestClient
from odmantic import AIOEngine
from motor.motor_asyncio import AsyncIOMotorClient
import pytest_asyncio
from main import app
from routers.user import get_user
from internal.models import User, UserTier
from utils.settings import get_settings
from utils.auth import access_auth


faker = Faker()


@pytest_asyncio.fixture(scope="session")
async def mongodb():
    """Fixture to set up a mock MongoDB instance."""
    client = AsyncIOMotorClient(
        f"mongodb://{get_settings().MONGODB_USERNAME}:{get_settings().MONGODB_PASSWORD}@localhost:27017/"
    )
    engine = AIOEngine(client=client, database="snappy")
    import utils.mongo

    utils.mongo.engine = engine
    utils.mongo.client = client
    yield engine
    # await client.drop_database("snappy_test")


@pytest_asyncio.fixture(scope="session")
async def client():
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
    yield user, token
    await mongodb.delete(user)


@pytest_asyncio.fixture(scope="function")
async def sample_premium_user(mongodb):
    user = generate_user_data("premium")
    await mongodb.save(user)
    token = access_auth.create_access_token(
        {"id": str(user.id), "username": user.username}
    )
    yield user, token
    await mongodb.delete(user)


@pytest.mark.asyncio
async def test_fetch_my_profile(client, sample_freemium_user):
    """Test the GET /user/profile/myself endpoint."""
    user, token = sample_freemium_user
    res = await client.get(
        "/user/profile/myself",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200


@pytest.mark.asyncio
async def test_fetch_others_profile(
    client, mongodb, sample_freemium_user, sample_premium_user
):
    """Test the GET /user/profile/{username} endpoint."""
    user1, token1 = sample_freemium_user
    print(user1)
    print(user1.id)
    res = await client.get(
        f"/user/profile/fetch/{str(user1.id)}",
        headers={"Authorization": f"Bearer {token1}"},
    )
    print(res.json())
    assert res.status_code == 200
