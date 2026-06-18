from pydantic import BaseModel, Field

class RegisterPayLoad(BaseModel):
    name: str = Field(min_length=1)
    
class UserResponse(BaseModel):
    id: str
    name: str
    is_guest: bool
    device_id: str
    onboarding_complete: bool
    dietary_restrictions: list[str] | None
    allergies: list[str] | None
    pantry_staples: list[str] | None
    user_skill: str | None
    
    class Config:
        from_attributes = True