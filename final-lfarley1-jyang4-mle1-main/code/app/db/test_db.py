import asyncio
from app.db.session import get_db, AsyncSessionLocal
from app.db.models import User

async def test_connection():
    async with AsyncSessionLocal() as db:
        user = User(device_id = "test-device-123")
        db.add(user)
        await db.commit()
        print("User created successfully")

if __name__ == "__main__":
    asyncio.run(test_connection())