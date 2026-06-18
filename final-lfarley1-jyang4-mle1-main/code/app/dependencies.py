from fastapi import Header, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import User
from app.db.session import get_db
from app.db.crud import get_or_create_user

async def get_device(x_device_id: str = Header(...), db: AsyncSession = Depends(get_db)):
   user = await get_or_create_user(db, x_device_id)
   
   return user