import json
import requests
import os
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from dotenv import load_dotenv
from app.db.models import Recipe
from openai import OpenAI

load_dotenv()
SPOONACULAR_KEY = os.getenv("SPOONACULAR_API_KEY")
MEALDB_URL = "https://www.themealdb.com/api/json/v1/1"
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def normalized_db_recipes(r) -> dict:
    return {
        "id": str(r.id),
        "name": r.name,
        "ingredients": r.ingredients,
        "instructions": r.instructions,
        "source": r.source
    }

async def fetch_from_db(db: AsyncSession, ingredients: list[str]) -> list[dict]:
    result = await db.execute(select(Recipe))
    recipes = result.scalars().all()
    
    ingredients_lower = [i.lower() for i in ingredients]
    filtered = [
        r for r in recipes
        if any(
            any(ui in ri.lower() or ri.lower() in ui for ri in r.ingredients)
            for ui in ingredients_lower
        )
    ]
    
    return [normalized_db_recipes(r) for r in filtered]

def normalize_spoonacular_recipe(r: dict) -> dict:
    return {
        "id": str(r.get("id", "")),
        "name": r.get("title", ""),
        "ingredients": [i.get("original", "") for i in r.get("extendedIngredients", [])],
        "instructions": r.get("instructions", ""),
        "source": r.get("sourceUrl", "spoonacular")
    }

async def fetch_from_spoonacular(ingredients: list[str]) -> list[dict]:
    search_res = requests.get(
        "https://api.spoonacular.com/recipes/findByIngredients",
        params={
            "ingredients": ",".join(ingredients),
            "number": 5,
            "ranking": 1,
            "apiKey": SPOONACULAR_KEY
        }
    )
    if search_res.status_code != 200:
        return []
    
    recipes = []
    for r in search_res.json():
        detail_res = requests.get(
            f"https://api.spoonacular.com/recipes/{r['id']}/information",
            params={"apiKey": SPOONACULAR_KEY}
        )
        if detail_res.status_code == 200:
            recipes.append(normalize_spoonacular_recipe(detail_res.json()))
    
    return recipes
    
def score_recipes(recipes: list[dict], user_ingredients: list[str]) -> list[dict]:
    user_ingredients_lower = [i.lower() for i in user_ingredients]
    
    scored = []
    for r in recipes:
        recipe_ings = [i.lower() for i in (r["ingredients"] or [])]
        
        matched = [
            ui for ui in user_ingredients_lower
            if any(ui in ri or ri in ui for ri in recipe_ings)
        ]
        missing = [
            ri for ri in recipe_ings
            if not any(ui in ri or ri in ui for ui in user_ingredients_lower)
        ]
        score = round(len(matched) / len(recipe_ings) * 100) if recipe_ings else 0
        
        scored.append({
            **r,
            "matchScore": score,
            "matchedIngredients": matched,
            "missingIngredients": missing
        })
    
    # sort by score and remove duplicates by name
    seen = set()
    unique = []
    for r in sorted(scored, key=lambda x: x["matchScore"], reverse=True):
        if r["name"] not in seen:
            seen.add(r["name"])
            unique.append(r)
    
    return unique

def load_user_prompt(ingredients: list[str],dietary_restrictions: list[str],allergies: list[str],user_skill: str,meal_type: str,candidates: list[dict]) -> str:
    user_prompt = ""
    
    prompt = open("app/services/prompts/user_prompt.txt", 'r')
    user_prompt = prompt.read()
    prompt.close()
    
    user_prompt = user_prompt.format(
        ingredients=", ".join(ingredients),
        dietary_restrictions=", ".join(dietary_restrictions) or "None",
        allergies=", ".join(allergies) or "None",
        user_skill=user_skill,
        meal_type=meal_type or "Any",
        candidates=json.dumps(candidates, indent=2)
    )

    return user_prompt

def load_system_prompt() -> str:
    system_prompt = ""
    
    prompt = open("app/services/prompts/system_prompt.txt", 'r')
    system_prompt = prompt.read()
    prompt.close()
    
    return system_prompt

def ai_select_top_recipes(candidates: list[dict], dietary_restrictions: list[str] = [], user_skill: str = "", allergies: list[str] = [], meal_type: str = "", ingredients: list[str] = []) -> list[dict]:        
    
    system_prompt = load_system_prompt()
    user_prompt = load_user_prompt(ingredients, dietary_restrictions, allergies,user_skill,  meal_type, candidates)
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.7,
    )

    raw = response.choices[0].message.content
    print("GPT RAW RESPONSE:", raw)  # ← add this
    parsed = json.loads(raw)
    
    recipes = parsed.get("recipes", [])
    
    #indices = parsed.get("selected_indices", [])
    selected = []
    for r in recipes:
        idx = r.get("index")
        if idx is not None and idx < len(candidates):
            candidate = candidates[idx]

            candidate["difficulty"] = r.get("difficulty")
            candidate["estimated_time"] = r.get("estimated_time")
            candidate['difficulty_reasoning'] = r.get("difficulty_reasoning")
            candidate['substitutions'] = r.get("substitutions", [])

            selected.append(candidate)

    # If GPT fails return top 3 by score
    if not selected:
        fallback = candidates[:3]
        for r in fallback:
            r["difficulty"] = "Unknown"
            r["estimated_time"] = None
            r['difficulty_reasoning'] = "N/A"
            r['substitutions'] = None
        return fallback
    
    return selected

    

async def generate_recipes(db: AsyncSession, ingredients: list[str], type: str,allergies: list[str] = [], 
                        user_skill: str = "beginner", dietary_restrictions: list[str] = []) -> list[dict]:
    db_recipes = await fetch_from_db(db, ingredients)
    spoonacular_recipes = await fetch_from_spoonacular(ingredients)
    
    all_recipes = db_recipes + spoonacular_recipes
    scored = score_recipes(all_recipes, ingredients)
    
    candidates_with_index = [
        {**r, "index": i} 
        for i, r in enumerate(scored[:10])
    ]

    return ai_select_top_recipes(candidates_with_index, dietary_restrictions, user_skill, allergies, type, ingredients)
    
