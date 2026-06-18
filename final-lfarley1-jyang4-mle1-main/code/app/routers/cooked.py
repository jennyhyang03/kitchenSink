from fastapi import APIRouter, Header, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.db import crud
from app.schemas.recipes import SaveRecipeRequest 

router = APIRouter(prefix="/cooked", tags=["cooked"])

@router.post("/")
async def log_cooked(
    payload: SaveRecipeRequest,
    x_device_id: str = Header(...),
    db: AsyncSession = Depends(get_db)
):
    return await crud.log_cooked_recipe(db, x_device_id, payload.recipe_id)

@router.get("/")
async def get_cooked(
    x_device_id: str = Header(...),
    db: AsyncSession = Depends(get_db)
):
    return await crud.get_cooked_history(db, x_device_id)