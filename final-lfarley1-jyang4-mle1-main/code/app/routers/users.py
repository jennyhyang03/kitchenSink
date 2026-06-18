from fastapi import APIRouter, Depends
from app.dependencies import get_device
from app.db.models import User
from app.schemas.users import RegisterPayLoad, UserResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register")
async def register(payload: RegisterPayLoad, user: User = Depends(get_device), db: AsyncSession = Depends(get_db)):
    if not user.is_guest:
        return {"message": "User already registered"}
    
    user.name = payload.name
    user.is_guest = False
    
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)
    
    
@router.get("/me")
async def get_user_info(user: User = Depends(get_device)):
    return UserResponse.model_validate(user)