from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.db.models import User, Ingredients, SavedRecipe, Recipe, CookedLog
from app.schemas.onboarding import OnboardingPayload

async def get_or_create_user(db, device_id):
    result = await db.execute(select(User).where(User.device_id == device_id))
    user = result.scalar_one_or_none()
    if not user:
        user = User(device_id = device_id)
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user
    
async def save_onboarding(db, device_id, payload):
    await db.execute(
        update(User).where(User.device_id == device_id).values(dietary_restrictions = payload.dietary_restrictions, allergies = payload.allergies, pantry_staples = payload.pantry_staples, onboarding_complete = True)
    )
    await db.commit()
    
async def save_ingredients(db, device_id, ingredients):
    new_entry = Ingredients(device_id = device_id, ingredients = ingredients)
    db.add(new_entry)
    await db.commit()

async def save_recipe(db, device_id: str, recipe_id: str):
    # check recipe exists
    result = await db.execute(
        select(Recipe).where(Recipe.id == recipe_id)
    )
    recipe = result.scalar_one_or_none()

    if not recipe:
        return {"error": "Recipe not found"}

    result = await db.execute(
        select(SavedRecipe).where(
            SavedRecipe.device_id == device_id,
            SavedRecipe.recipe_id == recipe_id
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        return {"message": "Recipe already saved"}

    saved = SavedRecipe(
        device_id=device_id,
        recipe_id=recipe_id
    )

    db.add(saved)
    await db.commit()

    return {"message": "Recipe saved successfully"}

async def get_saved_recipes(db: AsyncSession, device_id: str):
    result = await db.execute(
        select(SavedRecipe).where(SavedRecipe.device_id == device_id)
    )
    saved_rows = result.scalars().all()

    recipe_ids = [row.recipe_id for row in saved_rows]

    if not recipe_ids:
        return []

    result = await db.execute(
        select(Recipe).where(Recipe.id.in_(recipe_ids))
    )
    recipes = result.scalars().all()

    return recipes

async def log_cooked_recipe(db: AsyncSession, device_id: str, recipe_id: str):
    result = await db.execute(
        select(Recipe).where(Recipe.id == recipe_id)
    )
    recipe = result.scalar_one_or_none()

    if not recipe:
        return {"error": "Recipe not found"}

    log = CookedLog(
        device_id=device_id,
        recipe_id=recipe_id
    )

    db.add(log)
    await db.commit()

    return {"message": "Cooked recipe logged"}

async def get_cooked_history(db: AsyncSession, device_id: str):
    result = await db.execute(
        select(CookedLog).where(CookedLog.device_id == device_id)
    )
    logs = result.scalars().all()

    recipe_ids = [l.recipe_id for l in logs]

    if not recipe_ids:
        return []

    result = await db.execute(
        select(Recipe).where(Recipe.id.in_(recipe_ids))
    )
    recipes = result.scalars().all()

    return recipes