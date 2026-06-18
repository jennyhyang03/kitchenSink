import asyncio
import os
import requests
import string
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.db.models import Base, Recipe

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
MEALDB_URL = "https://www.themealdb.com/api/json/v1/1"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

def normalize_mealdb_recipe(r: dict) -> dict:
    ingredients = []
    for i in range(1, 21):
        ing = (r.get(f"strIngredient{i}") or "").strip()  # handles None safely
        measure = (r.get(f"strMeasure{i}") or "").strip()
        if ing:
            ingredients.append(f"{measure} {ing}".strip())
    return {
        "name": r.get("strMeal", ""),
        "ingredients": ingredients,
        "instructions": r.get("strInstructions", ""),
        "source": r.get("strSource") or "mealdb"  
    }
    
def fetch_all_mealdb_recipes() -> list[dict]:
    all_recipes = []
    for letter in string.ascii_lowercase:
        print(f"Fetching recipes starting with '{letter}'...")
        res = requests.get(f"{MEALDB_URL}/search.php?f={letter}")
        if res.status_code == 200:
            meals = res.json().get("meals") or []
            for meal in meals:
                all_recipes.append(normalize_mealdb_recipe(meal))
    print(f"Fetched {len(all_recipes)} recipes from MealDB")
    return all_recipes

async def seed_mealdb():
    async with AsyncSessionLocal() as db:
        all_recipes = fetch_all_mealdb_recipes()
        for recipe in all_recipes:
            db.add(Recipe(**recipe))
        await db.commit()

if __name__ == "__main__":
    asyncio.run(seed_mealdb())