from pydantic import BaseModel

class RecipeRequest(BaseModel):
    ingredients: list[str]
    meal_type: str
    dietary_restrictions: list[str] = []
    allergies: list[str] = []
    
class Recipe(BaseModel):
    name: str
    ingredients: list[str]
    instructions: str
    source: str
    difficulty: str
    time: str
    
class SaveRecipeRequest(BaseModel):
    recipe_id: str