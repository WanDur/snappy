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
from internal.models import Friendship, User, UserTier
from utils.mongo import get_prod_database
from utils.settings import get_settings
from utils.auth import access_auth
from .conftest import add_random_user, get_user_token


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
    updatedUser = await mongodb.find_one(User, User.id == user.id)
    assert res.status_code == 200
    assert updatedUser.email == "test@test.com"
    assert updatedUser.username == "test"
    assert updatedUser.name == "test"
    assert updatedUser.phone == "(+1) 234567890"
    assert updatedUser.bio == "test bio"

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
async def test_user_icon(client, sample_freemium_user, mongodb):
    """Test the POST /user/profile/icon/upload and DELETE /user/profile/icon/remove endpoints."""
    user, token = sample_freemium_user
    with open(
        os.path.join(os.path.dirname(__file__), "assets/upload_photo_1.jpg"), "rb"
    ) as photo_file:
        res = await client.post(
            f"/user/profile/icon/upload",
            headers={"Authorization": f"Bearer {token}"},
            files={"file": ("upload_photo_1.jpg", photo_file.read(), "image/jpeg")},
        )

    updateUser = await mongodb.find_one(User, User.id == user.id)

    assert res.status_code == 200
    assert res.json()["filePath"] is not None
    assert updateUser.iconUrl is not None

    res = await client.delete(
        "/user/profile/icon/remove",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    assert user.iconUrl is None


@pytest.mark.asyncio()
async def test_search_username(client, sample_freemium_user, mongodb):
    """Test the GET /user/search endpoint."""
    user, token = sample_freemium_user

    for _ in range(10):
        await add_random_user(mongodb)
    await add_random_user(mongodb, username="test_bilibili")

    res = await client.get(
        "/user/search",
        headers={"Authorization": f"Bearer {token}"},
        params={"query": "bil"},
    )

    assert res.status_code == 200
    assert len(res.json()["users"]) >= 1


@pytest.mark.asyncio
async def test_invite_friend(client_mongodb):
    """Test the POST /user/friends/invite/{target_user_id} endpoint."""
    client, mongodb = client_mongodb
    user1, password1 = await add_random_user(mongodb)
    user2, password2 = await add_random_user(mongodb)

    token1 = await get_user_token(client, user1.username, password1)
    token2 = await get_user_token(client, user2.username, password2)

    print("user1 id from test", user1.id)
    print("user2 id from test", user2.id)

    res = await client.post(
        f"/user/friends/invite/{str(user2.id)}",
        headers={"Authorization": f"Bearer {token1}"},
    )
    assert res.status_code == 200
    print(await mongodb.find_one(Friendship, Friendship.user1 == user1.id))

    res = await client.post(
        f"/user/friends/accept/{str(user1.id)}",
        headers={"Authorization": f"Bearer {token2}"},
    )
    print(res.json())
    assert res.status_code == 200
    assert (
        await mongodb.find_one(
            Friendship,
            Friendship.user1 == user1.id,
            Friendship.user2 == user2.id,
        )
        is not None
    )

    res = await client.post(
        f"/user/friends/remove/{str(user1.id)}",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert res.status_code == 200
    assert (
        await mongodb.find_one(
            Friendship,
            Friendship.user1 == user1.id,
            Friendship.user2 == user2.id,
        )
    ) is None
