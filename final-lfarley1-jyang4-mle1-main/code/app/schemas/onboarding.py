from pydantic import BaseModel

class OnboardingPayload(BaseModel):
    dietary_restrictions : list[str] = []
    allergies: list[str] = []
    pantry_staples: list[str] = []
    user_skill: str #beginner, intermediate, advanced
    