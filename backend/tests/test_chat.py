from datetime import datetime, timezone
import os
import random
from bson import ObjectId
from faker import Faker
import pytest
import requests

from internal.models import Conversation, ConversationType, Friendship
from .conftest import add_random_user, get_user_token


@pytest.mark.asyncio
async def test_create_direct_conversation(client, mongodb):
    user1, password1 = await add_random_user(mongodb)
    user2, password2 = await add_random_user(mongodb, friend_with=user1)
    token1 = await get_user_token(client, user1.username, password1)

    res = await client.post(
        "/chat/create/direct",
        headers={"Authorization": f"Bearer {token1}"},
        json={
            "targetUserId": str(user2.id),
        },
    )
    assert res.status_code == 200
    assert res.json()["conversationId"] is not None


@pytest.mark.asyncio
async def test_group_conversation(client, mongodb):
    """
    Test the operations of a group conversation.
    - POST /chat/create/group
    - PUT /chat/{conversation_id}/edit
    """
    user1, password1 = await add_random_user(mongodb)
    users, _ = await add_random_user(mongodb, count=3, friend_with=user1)
    token1 = await get_user_token(client, user1.username, password1)

    res = await client.post(
        "/chat/create/group",
        headers={"Authorization": f"Bearer {token1}"},
        json={
            "participants": [str(user.id) for user in users],
            "name": "Test Group",
        },
    )
    assert res.status_code == 200
    assert res.json()["conversationId"] is not None

    conversation = await mongodb.find_one(
        Conversation, Conversation.id == ObjectId(res.json()["conversationId"])
    )
    assert conversation is not None
    assert conversation.type == ConversationType.GROUP
    assert conversation.name == "Test Group"
    assert sorted(conversation.participants) == sorted(
        [user1.id, *[user.id for user in users]]
    )

    # Test editing group information
    chosen_user_ids = [user.id for user in random.sample(users, 2)]
    res = await client.put(
        f"/chat/{conversation.id}/edit",
        headers={"Authorization": f"Bearer {token1}"},
        json={
            "name": "Updated Group Name",
            "participants": [str(user1.id), *map(str, chosen_user_ids)],
        },
    )

    assert res.status_code == 200

    updated_conversation = await mongodb.find_one(
        Conversation, Conversation.id == conversation.id
    )
    assert updated_conversation.name == "Updated Group Name"
    assert sorted(updated_conversation.participants) == sorted(
        [user1.id, *chosen_user_ids]
    )
