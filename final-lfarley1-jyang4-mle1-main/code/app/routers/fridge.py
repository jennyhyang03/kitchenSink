from fastapi import APIRouter, UploadFile, File, Depends
import os, shutil
from app.services.vision import identify_food
from app.schemas.fridge import ManualIngredientsPayload, UpdateIngredientsPayload
from app.dependencies import get_device
from app.db.session import get_db
from app.db.crud import save_ingredients 

router = APIRouter(prefix="/fridge", tags = ["fridge"])

## upload an image
@router.post("/analyze")
async def analyze_fridge(file: UploadFile = File(...), device = Depends(get_device), db = Depends(get_db)):
    os.makedirs("tmp", exist_ok = True)
    
    tmp_path = f"tmp/{file.filename}"
    with open(tmp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    ingredients = identify_food(tmp_path)
    
    await save_ingredients(db, device.device_id, ingredients)
    
    os.remove(tmp_path)
    
    return {"ingredients": ingredients}

#manually put ingredients
@router.post("/manual")
async def manual_ingredients(payload: ManualIngredientsPayload, device = Depends(get_device), db = Depends(get_db)):
    await save_ingredients(db, device.device_id, payload.ingredients)
    return {"ingredients": payload.ingredients}

@router.patch("/ingredients")
async def edit_ingredients(payload : UpdateIngredientsPayload,device = Depends(get_device), db = Depends(get_db)):
    return {"ingredients" : payload.ingredients}

    