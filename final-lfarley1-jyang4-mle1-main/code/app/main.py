from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import fridge, recipes, onboarding, users, saved_recipes, cooked

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
        "https://kitchensink-five.vercel.app"],  # Next.js runs on port 3000
    allow_credentials=True,
    allow_methods=["*"],  # allows OPTIONS, GET, POST, PATCH etc.
    allow_headers=["*"],  # allows X-Device-ID and Content-Type
)

app.include_router(fridge.router)
app.include_router(recipes.router)
app.include_router(onboarding.router)
app.include_router(users.router)
app.include_router(saved_recipes.router)
app.include_router(cooked.router)