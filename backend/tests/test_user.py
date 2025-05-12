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
from utils.mongo import get_prod_database
from utils.settings import get_settings
from utils.auth import access_auth


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
