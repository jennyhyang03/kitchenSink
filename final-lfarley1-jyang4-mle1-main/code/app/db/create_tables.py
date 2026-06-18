import asyncio
from app.db.models import Base
from app.db.session import engine

async def create_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created successfully")
    
if __name__ == "__main__":
    asyncio.run(create_db())