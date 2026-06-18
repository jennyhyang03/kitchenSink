from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, Float
from sqlalchemy.dialects.postgresql import JSON, UUID, ARRAY
from sqlalchemy.orm import declarative_base
from datetime import datetime
from uuid import uuid4

## Set up the database tables

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    #columns to save
    id = Column(UUID(as_uuid = True), primary_key= True, default=uuid4)
    device_id = Column(String, unique= True, nullable= False)
    onboarding_complete = Column(Boolean, default= False)
    dietary_restrictions = Column(JSON, nullable=True)
    allergies = Column(JSON, nullable=True)
    pantry_staples =  Column(JSON, nullable=True)
    user_skill = Column(String) #beginner, intermediate, advanced

# class User(Base):
#     __tablename__ = "users"
    
#     id = Column(UUID(as_uuid = True), primary_key= True, default=uuid4)
#     name = Column(String, nullable=False)
#     is_guest = Column(Boolean, default=False)
#     device_id = Column(String, unique= True, nullable= False)
#     onboarding_complete = Column(Boolean, default= False)
#     dietary_restrictions = Column(ARRAY(String))
#     allergies = Column(ARRAY(String))
#     pantry_staples =  Column(ARRAY(String))
#     user_skill = Column(String) #beginner, intermediate, advanced
    
class Ingredients(Base):
    __tablename__ = "ingredients"
    
    id = Column(UUID(as_uuid = True), primary_key= True, default=uuid4)
    device_id = Column(String, nullable= False)
    ingredients = Column(JSON, nullable=False)
    #created_at = Column(DateTime, default = datetime.utcnow)

class Recipe(Base):
    __tablename__ = "recipes"
 
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    ingredients = Column(ARRAY(String), nullable=False)  # list of ingredient names for matching
    instructions = Column(Text, nullable=False)
    prep_time_minutes = Column(Integer, nullable=True)
    cook_time_minutes = Column(Integer, nullable=True)
    # calories = Column(Float, nullable=True)
    # protein_g = Column(Float, nullable=True)
    # carbs_g = Column(Float, nullable=True)
    # fat_g = Column(Float, nullable=True)
    source = Column(String, default="kaggle")  # "kaggle" or "openai"
    #created_at = Column(DateTime, default=datetime.utcnow)
    
class SavedRecipe(Base):
    __tablename__ = "saved_recipes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    device_id = Column(String, nullable=False)
    recipe_id = Column(UUID(as_uuid=True), nullable=False)
    
class CookedLog(Base):
    __tablename__ = "cooked_log"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    device_id = Column(String, nullable=False)
    recipe_id = Column(UUID(as_uuid=True), nullable=False)
    cooked_at = Column(DateTime, default=datetime.utcnow)
    