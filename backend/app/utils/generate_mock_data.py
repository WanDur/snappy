import asyncio
from datetime import datetime, timedelta
import random
from faker import Faker

faker = Faker()

if __name__ == "__main__":

    import os
    import sys

    _proj_path = os.path.abspath(
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
    )
    print(_proj_path)
    sys.path.append(_proj_path)
    __package__ = "utils.generate_mock_data"


import bcrypt
from internal.models import User, UserTier
from utils.mongo import engine


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


async def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--reset":
        print("Resetting database...", end=" ")
        await engine.remove(User)
        print("Done!")

    login_user = User(
        username="root",
        bcryptPassword=bcrypt.hashpw("root".encode("utf-8"), bcrypt.gensalt()),
        name="John Doe",
        email="johndoe123@example.com",
        phone=f"(+852) 999",
        tier=UserTier.PREMIUM,
        premiumExpireTime=datetime.now() + timedelta(days=365),
    )
    await engine.save(login_user)
    print("Generated sample user for login:")
    print(f"Email: johndoe123@example.com")
    print(f"Username: root")
    print(f"Password: root")

    # Generate User Data
    for i in range(10):
        user = generate_user_data(random.choice([UserTier.FREEMIUM, UserTier.PREMIUM]))
        await engine.save(user)
    print("Generated 10 users")


if __name__ == "__main__":
    asyncio.run(main())
