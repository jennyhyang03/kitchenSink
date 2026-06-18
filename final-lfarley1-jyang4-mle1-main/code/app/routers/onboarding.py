from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_device
from app.db.crud import save_onboarding
from app.schemas.onboarding import OnboardingPayload

router = APIRouter(prefix="/onboarding", tags = ["onboarding"])

@router.get("/options")
async def get_onboarding_options():
    return {
        "dietary_restrictions": ["No Diet Preferences", "Vegetarian", "Vegan", "Pescatarian",
        "Gluten-free", "Halal", "Kosher", "Dairy-free",
        "Keto", "Paleo", "Low-carb", 'Low-sodium',
        'Mediterranean', 'Whole30',
        ], 
        "allergies": [
            'No Allergies','Peanuts', 'Tree nuts', 'Milk', 'Eggs',
            'Wheat', 'Soy', 'Fish', 'Shellfish', 'Sesame',
            'Mustard', 'Celery', 'Sulphites',
        ], 
        "pantry_staples": [
            'Olive oil', 'Vegetable oil', 'Butter', 'Garlic',
            'Onion', 'Salt', 'Pepper', 'Sugar', 'Flour', 'Rice',
            'Pasta', 'Soy Sauce', 'Cinnamon', 'Bread', 'Eggs',
            'Lemon', 'Avocados', 'Chicken broth', 'Tomato paste',
            'Canned tomatoes', 'Baking soda', 'Honey', 'Vinegar',
            'Hot sauce', 'Paprika', 'Cumin', 'Oregano', 'Oats',
        ],
        "user_skill": [
            {"value": "Beginner", "description": "Just getting started in the kitchen, looking for simple recipes and basic techniques."},
            {"value": "Intermediate", "description": "You've got some cooking experience and are ready for more challenging recipes."},
            {"value": "Advanced", "description": "You're a seasoned cook with a deep understanding of techniques and flavors."}
        ]
    }

@router.post("")
async def post_onboarding(payload: OnboardingPayload, device = Depends(get_device), db: AsyncSession = Depends(get_db)):
    await save_onboarding(db, device.device_id, payload)
    
    return {"message": "Onboarding Complete"}