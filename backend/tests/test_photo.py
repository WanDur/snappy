from datetime import datetime, timezone
import os
from bson import ObjectId
from faker import Faker
import pytest
import requests

from internal.models import Friendship, Photo, PhotoComment, PhotoLike
from .conftest import generate_user_data, add_random_user


@pytest.mark.asyncio
async def test_create_photo_fetch(client, mongodb, sample_freemium_user):
    """Test the POST /photo/create endpoint."""
    user, token = sample_freemium_user

    with open(
        os.path.join(os.path.dirname(__file__), "assets/upload_photo_1.jpg"), "rb"
    ) as photo_file:
        res = await client.post(
            f"/photo/upload",
            headers={"Authorization": f"Bearer {token}"},
            files={"file": ("upload_photo_1.jpg", photo_file.read(), "image/jpeg")},
        )

    assert res.status_code == 200
    assert res.json()["photoId"] is not None
    assert res.json()["filePath"] is not None

    file_path = res.json()["filePath"]

    res = await client.get(
        f"/public/{file_path}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert res.status_code == 200


@pytest.mark.asyncio
async def test_like_photo(client, mongodb, sample_freemium_user):
    """Test the POST /photo/{photo_id}/like endpoint."""
    user, token = sample_freemium_user

    with open(
        os.path.join(os.path.dirname(__file__), "assets/upload_photo_1.jpg"), "rb"
    ) as photo_file:
        res = await client.post(
            f"/photo/upload",
            headers={"Authorization": f"Bearer {token}"},
            files={"file": ("upload_photo_1.jpg", photo_file.read(), "image/jpeg")},
        )

    assert res.status_code == 200
    assert res.json()["photoId"] is not None
    assert res.json()["filePath"] is not None

    photo_id = res.json()["photoId"]
    photo = await mongodb.find_one(Photo, Photo.id == ObjectId(photo_id))

    res = await client.post(
        f"/photo/{photo_id}/like",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert res.status_code == 200
    assert await mongodb.find_one(
        PhotoLike, PhotoLike.photo == ObjectId(photo_id), PhotoLike.user == user.id
    )

    res = await client.post(
        f"/photo/{photo_id}/unlike",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert res.status_code == 200
    assert not await mongodb.find_one(
        PhotoLike, PhotoLike.photo == ObjectId(photo_id), PhotoLike.user == user.id
    )


@pytest.mark.asyncio
async def test_photo_comment(client, mongodb, sample_freemium_user):
    """Test the POST /photo/{photo_id}/comment endpoint."""
    user, token = sample_freemium_user

    with open(
        os.path.join(os.path.dirname(__file__), "assets/upload_photo_1.jpg"), "rb"
    ) as photo_file:
        res = await client.post(
            f"/photo/upload",
            headers={"Authorization": f"Bearer {token}"},
            files={"file": ("upload_photo_1.jpg", photo_file.read(), "image/jpeg")},
        )

    assert res.status_code == 200
    assert res.json()["photoId"] is not None
    assert res.json()["filePath"] is not None

    photo_id = res.json()["photoId"]

    res = await client.post(
        f"/photo/{photo_id}/comment",
        headers={"Authorization": f"Bearer {token}"},
        json={"message": "test comment"},
    )

    assert res.status_code == 200
    comment_id = res.json()["commentId"]
    assert await mongodb.find_one(PhotoComment, PhotoComment.id == ObjectId(comment_id))

    res = await client.get(
        f"/photo/{photo_id}/comments",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert res.status_code == 200
    assert len(res.json()["comments"]) == 1
    assert res.json()["comments"][0]["message"] == "test comment"
    assert res.json()["comments"][0]["userId"] == str(user.id)

    res = await client.delete(
        f"/photo/comment/{comment_id}/delete",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert res.status_code == 200
    assert not await mongodb.find_one(
        PhotoComment,
        PhotoComment.photo == ObjectId(photo_id),
        PhotoComment.user == user.id,
    )


@pytest.mark.asyncio
async def test_tag_photo(client, mongodb, sample_freemium_user):
    """Test the POST /photo/{photo_id}/tag endpoint."""
    user, token = sample_freemium_user
    user2, _ = await add_random_user(mongodb, friend_with=user)

    with open(
        os.path.join(os.path.dirname(__file__), "assets/upload_photo_1.jpg"), "rb"
    ) as photo_file:
        res = await client.post(
            f"/photo/upload",
            headers={"Authorization": f"Bearer {token}"},
            files={"file": ("upload_photo_1.jpg", photo_file.read(), "image/jpeg")},
        )

    assert res.status_code == 200
    assert res.json()["photoId"] is not None
    assert res.json()["filePath"] is not None

    photo_id = res.json()["photoId"]

    res = await client.post(
        f"/photo/{photo_id}/tag",
        headers={"Authorization": f"Bearer {token}"},
        json={"taggedUserIds": [str(user2.id)]},
    )

    print(res.json())
    assert res.status_code == 200
    photo = await mongodb.find_one(Photo, Photo.id == ObjectId(photo_id))
    assert photo.taggedUserIds == [user2.id]
