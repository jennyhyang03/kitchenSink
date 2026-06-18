from pydantic import BaseModel

class ManualIngredientsPayload(BaseModel):
    ingredients: list[str]
    
class UpdateIngredientsPayload(BaseModel):
    ingredients:list[str]