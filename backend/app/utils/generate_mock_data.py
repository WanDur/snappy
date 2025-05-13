if __name__ == "__main__":

    import os
    import sys
    import dotenv

    dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

    _proj_path = os.path.abspath(
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
    )
    sys.path.append(_proj_path)
    __package__ = "utils.generate_mock_data"

import asyncio
from datetime import datetime, timedelta, timezone
import random
from faker import Faker
import bcrypt
from internal.models import Friendship, Photo, User, UserTier
from routers.license import generate_license_keys
from utils.minio_server import upload_file
from utils.mongo import get_prod_database

faker = Faker()


def generate_user_data(tier: UserTier = UserTier.FREEMIUM) -> tuple[User, str]:
    password = faker.password().encode("utf-8")
    profile = faker.simple_profile()
    user = User(
        username=profile["username"],
        bcryptPassword=bcrypt.hashpw(password, bcrypt.gensalt()),
        name=profile["name"],
        email=profile["mail"],
        phone=f"(+852) {faker.random_number(digits=8)}",
        tier=tier,
        premiumExpireTime=(
            faker.date_time_this_year(after_now=True) if tier == "premium" else None
        ),
    )
    return user, password.decode("utf-8")


async def main():
    engine = get_prod_database()
    if len(sys.argv) > 1 and sys.argv[1] == "--reset":
        print("Resetting database...", end=" ")
        await engine.remove(User)
        await engine.remove(Friendship)
        await engine.remove(Photo)
        print("Done!")

    login_user = User(
        username="root",
        bcryptPassword=bcrypt.hashpw("root".encode("utf-8"), bcrypt.gensalt()),
        name="John Doe",
        email="johndoe123@example.com",
        phone=f"(+852) 999",
        tier=UserTier.ADMIN,
        premiumExpireTime=datetime.now(timezone.utc) + timedelta(days=365),
    )
    await engine.save(login_user)
    print(f"========== SAMPLE ADMIN USER #1 ==========")
    print(f"Email: johndoe123@example.com")
    print(f"Username: root")
    print(f"Password: root")

    # Read sample photos
    photos = []
    for i in range(1, 4):
        with open(
            os.path.join(os.path.dirname(__file__), "assets", f"photo{i}.jpg"), "rb"
        ) as f:
            photos.append(f.read())

    # Generate User Data
    for i in range(5):
        user, password = generate_user_data(
            random.choice([UserTier.FREEMIUM, UserTier.PREMIUM])
        )
        await engine.save(user)
        upload_photos = random.choices(photos, k=random.randint(1, 3))
        for j, photo_file in enumerate(upload_photos):
            url = upload_file(
                f"users/{user.id}/photos/{random.randint(1, 1000000)}.jpg", photo_file
            )
            photo = Photo(
                user=user,
                timestamp=datetime.now(timezone.utc),
                url=url,
            )
            await engine.save(photo)
        print(f"========== SAMPLE {user.tier} USER #{i+2} ==========")
        print(f"ID: {user.id}")
        print(f"Email: {user.email}")
        print(f"Username: {user.username}")
        print(f"Password: {password}")
        print(f"Photos: {len(upload_photos)}")

    for i in range(5):
        user, password = generate_user_data(UserTier.FREEMIUM)
        friendship = Friendship(
            user1=login_user,
            user2=user,
            accepted=True,
            inviteTimestamp=datetime.now(timezone.utc),
        )
        await engine.save(user)
        await engine.save(friendship)
        upload_photos = random.choices(photos, k=random.randint(1, 3))
        for photo_file in upload_photos:
            url = upload_file(
                f"users/{user.id}/photos/{random.randint(1, 1000000)}.jpg", photo_file
            )
            photo = Photo(
                user=user,
                timestamp=datetime.now(timezone.utc),
                url=url,
            )
            await engine.save(photo)
        print(f"========== SAMPLE FREEMIUM FRIEND USER #{i+11} ==========")
        print(f"ID: {user.id}")
        print(f"Email: {user.email}")
        print(f"Username: {user.username}")
        print(f"Password: {password}")
        print(f"Photos: {len(upload_photos)}")

    keys = await generate_license_keys(engine, 30, 10)
    print(f"========== SAMPLE LICENSE KEYS (30 DAYS) ==========")
    print("\n".join(keys))
    print(
        "You may create a key file by putting keys in a file 'sample_keys.key' seperated by newlines."
    )


if __name__ == "__main__":
    asyncio.run(main())
