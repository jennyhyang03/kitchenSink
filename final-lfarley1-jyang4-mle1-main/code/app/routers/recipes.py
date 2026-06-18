from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.recipes import RecipeRequest
from app.services.recipe_generation import generate_recipes
from app.db.session import get_db

router = APIRouter(prefix="/recipes", tags=["recipes"])

@router.post("/generate")
async def generate_recipes_endpoint(payload: RecipeRequest, db: AsyncSession = Depends(get_db)):
    recipes = await generate_recipes(db, payload.ingredients, payload.meal_type, payload.allergies, payload.dietary_restrictions)
    return {"recipes": recipes}