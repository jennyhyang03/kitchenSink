from fastapi import APIRouter, Header, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.db.crud import save_recipe, get_saved_recipes
from app.schemas.recipes import SaveRecipeRequest


router = APIRouter(prefix="/saved-recipes", tags=["saved-recipes"])

@router.post("/save-recipe")
async def save_recipe_endpoint(
    payload: SaveRecipeRequest,
    x_device_id: str = Header(...),
    db: AsyncSession = Depends(get_db)
):
    return await save_recipe(db, x_device_id, payload.recipe_id)

@router.get("/")
async def get_saved_recipes_endpoint(x_device_id: str = Header(...), db: AsyncSession = Depends(get_db)):
    return await get_saved_recipes(db, x_device_id)