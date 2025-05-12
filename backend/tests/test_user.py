import asyncio
import os
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


@pytest.mark.asyncio
async def test_update_profile(client, sample_freemium_user, mongodb):
    """Test the POST /user/profile/update endpoint."""
    user, token = sample_freemium_user
    res = await client.post(
        "/user/profile/edit",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "email": "test@test.com",
            "password": "test",
            "username": "test",
            "name": "test",
            "phone": "(+1) 234567890",
            "bio": "test bio",
        },
    )
    assert res.status_code == 200
    assert user.email == "test@test.com"
    assert user.username == "test"
    assert user.name == "test"
    assert user.phone == "(+1) 234567890"
    assert user.bio == "test bio"

    res = await client.post(
        "/auth/login",
        json={
            "emailUsernamePhone": "test@test.com",
            "password": "test",
        },
    )
    assert res.status_code == 200
    assert res.json()["accessToken"] is not None
    assert res.json()["refreshToken"] is not None


@pytest.mark.asyncio
async def test_upload_user_icon(client, sample_freemium_user):
    """Test the POST /user/profile/icon/upload endpoint."""
    user, token = sample_freemium_user
    with open(
        os.path.join(os.path.dirname(__file__), "assets/upload_photo_1.jpg"), "rb"
    ) as photo_file:
        res = await client.post(
            f"/user/profile/icon/upload",
            headers={"Authorization": f"Bearer {token}"},
            files={"file": ("upload_photo_1.jpg", photo_file.read(), "image/jpeg")},
        )

    assert res.status_code == 200
    assert res.json()["filePath"] is not None
    assert user.iconUrl is not None

    res = await client.delete(
        "/user/profile/icon/remove",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    assert user.iconUrl is None
