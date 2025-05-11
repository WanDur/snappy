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
from internal.models import User, UserTier
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
        print("Done!")

    login_user = User(
        username="root",
        bcryptPassword=bcrypt.hashpw("root".encode("utf-8"), bcrypt.gensalt()),
        name="John Doe",
        email="johndoe123@example.com",
        phone=f"(+852) 999",
        tier=UserTier.PREMIUM,
        premiumExpireTime=datetime.now(timezone.utc) + timedelta(days=365),
    )
    await engine.save(login_user)
    print(f"========== SAMPLE PREMIUM USER #1 ==========")
    print(f"Email: johndoe123@example.com")
    print(f"Username: root")
    print(f"Password: root")

    # Generate User Data
    for i in range(9):
        user, password = generate_user_data(
            random.choice([UserTier.FREEMIUM, UserTier.PREMIUM])
        )
        await engine.save(user)
        print(f"========== SAMPLE {user.tier} USER #{i+2} ==========")
        print(f"Email: {user.email}")
        print(f"Username: {user.username}")
        print(f"Password: {password}")


if __name__ == "__main__":
    asyncio.run(main())
