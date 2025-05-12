from datetime import datetime, timezone
import os
from faker import Faker
import pytest
import requests

from internal.models import Friendship
from .conftest import generate_user_data


@pytest.mark.asyncio
async def test_create_album(client, mongodb, sample_freemium_user):
    """Test the POST /album/create and DELETE /album/{album_id}/delete endpoint."""
    user, token = sample_freemium_user
    other_users = []
    for _ in range(3):
        new_user, _ = generate_user_data()
        await mongodb.save(new_user)
        other_users.append(new_user)
        frdship = Friendship(
            user1=user,
            user2=new_user,
            accepted=True,
            inviteTimestamp=datetime.now(timezone.utc),
        )
        await mongodb.save(frdship)

    res = await client.post(
        "/album/create",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "name": "test album",
            "shared": True,
            "participants": [
                str(user.id),
                str(other_users[0].id),
                str(other_users[1].id),
                str(other_users[2].id),
            ],
        },
    )

    print(res.json())

    assert res.status_code == 200
    assert res.json()["albumId"] is not None
    assert res.json()["createdAt"] is not None

    res = await client.delete(
        f"/album/{res.json()['albumId']}/delete",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert res.status_code == 200
    assert res.json()["status"] == "success"


@pytest.mark.asyncio
async def test_edit_album(client, mongodb, sample_freemium_user):
    """Test the POST /album/{album_id}/edit endpoint."""
    user, token = sample_freemium_user

    # Create album
    res = await client.post(
        "/album/create",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "name": "test album",
            "participants": [str(user.id)],
            "shared": True,
        },
    )

    assert res.status_code == 200
    assert res.json()["albumId"] is not None
    assert res.json()["createdAt"] is not None

    album_id = res.json()["albumId"]

    # Edit the album's name and add a new partcipant
    friend, _ = generate_user_data()
    await mongodb.save(friend)
    frdship = Friendship(
        user1=user,
        user2=friend,
        accepted=True,
        inviteTimestamp=datetime.now(timezone.utc),
    )
    await mongodb.save(frdship)
    res = await client.post(
        f"/album/{album_id}/edit",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "edited album",
            "participants": [str(user.id), str(friend.id)],
        },
    )
    print(friend)
    print(frdship)

    print(res.json())
    assert res.status_code == 200
    assert res.json()["name"] == "edited album"
    assert res.json()["participants"] == [str(user.id), str(friend.id)]
    assert res.json()["createdAt"] is not None


@pytest.mark.asyncio
async def test_album_upload_photo_and_fetch(client, mongodb, sample_freemium_user):
    """Test the POST /album/{album_id}/upload endpoint."""
    user, token = sample_freemium_user

    # Create album
    res = await client.post(
        "/album/create",
        headers={"Authorization": f"Bearer {token}"},
        data={"name": "test album", "participants": [str(user.id)], "shared": True},
    )

    assert res.status_code == 200
    assert res.json()["albumId"] is not None
    assert res.json()["createdAt"] is not None

    album_id = res.json()["albumId"]

    # Upload photo
    with open(
        os.path.join(os.path.dirname(__file__), "assets/upload_photo_1.jpg"), "rb"
    ) as photo_file:
        res = await client.post(
            f"/album/{album_id}/upload",
            headers={"Authorization": f"Bearer {token}"},
            files={"files": ("upload_photo_1.jpg", photo_file.read(), "image/jpeg")},
        )

    print(res.json())
    assert res.status_code == 200
    assert res.json()["photoId"] is not None
    assert res.json()["filePath"] is not None

    # Fetch photo
    current_date = datetime.now(timezone.utc)
    res = await client.get(
        f"/album/{album_id}/fetch",
        headers={"Authorization": f"Bearer {token}"},
        params={
            "fromYear": current_date.year,
            "fromWeek": current_date.isocalendar()[1],
            "toYear": current_date.year,
            "toWeek": current_date.isocalendar()[1],
        },
    )
    print(res.json())
    assert res.status_code == 200
    assert res.json()["photos"] is not None
    assert res.json()["photos"][0]["url"] is not None
    assert res.json()["photos"][0]["timestamp"] is not None
    assert res.json()["photos"][0]["user"]["id"] == str(user.id)
    assert res.json()["photos"][0]["user"]["username"] == user.username
    assert res.json()["photos"][0]["user"]["name"] == user.name
    assert res.json()["photos"][0]["user"]["iconUrl"] == user.iconUrl
