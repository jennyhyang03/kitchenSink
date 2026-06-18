# KitchenSink 

An AI powered recipe generation site.

### Prerequisites

- Python 3.11+
- Node.js 18+ (includes npm)
- Optional: virtual environment for Python

## Getting started 

Install Requirements

``` 
uv pip install -r requirements.txt
``` 

## Environment Setup 
1. Copy .env.example to a new file named .env 
2. Fill in the required environment variables in .env


## How to Run

### Populate databases and tables:

```
cd code
python -m app.db.create_tables ## create railway db tables
python -m scripts.seed_mealdb

```
### Run the backend

```
cd code
uvicorn app.main:app --reload ## run in terminal to set up backend
```

###  Run the frontend in a separate terminal
```
cd code                        
terminal to set up front end
npm install
npm run dev                   
```


### How to Run Evaluations:

(Evaluations located in `/code/app/evaluations`) 
```
cd code
python -m app.evaluations.accuracy
```

# API Endpoints

## Fridge 

* Post `/fridge/analyze` - upload a in image of fridge
    - input: image file
    - returns: 

    ```json
    {
    "ingredients": ["milk", "eggs", "butter"]
    }
  ```

* Post `/fridge/manual` - manually add ingredients (skip image upload)
    - input: 

    ```json
    {
  "ingredients": ["milk", "eggs", "butter"]
    }
    ```

    - output: 

    ```json
    {
  "ingredients": ["milk", "eggs", "butter"]
    }
    ```

* PATCH `/fridge/ingredients` - update / edit ingredients

    - input: 
    ```json
    {
    "ingredients": ["milk", "eggs", "butter", "spinach"]
    }
    ```
    - output:

    **Response:**
    ```json
    {
    "ingredients": ["milk", "eggs", "butter", "spinach"]
    }
    ```

### Recipes

* Post `/recipes/generate` - generate recipes based on ingredients available

    - input: list of ingredients

    - returns: generated recipes

### Onboarding 

* Get `/onboarding/options` - returns preset options for dietary restrictions, allergies, and pantry staples (call when loading onboarding)

    - Output: 

    ```json
    {
    "dietary_restrictions": ["Vegetarian", "Vegan", "Gluten-free"],
    "allergies": ["Peanuts", "Tree nuts", "Milk"],
    "pantry_staples": ["Olive oil", "Garlic", "Salt"]
    }
    ```

* Post `/onboarding` - save the user onboarding preferences (call when user finishes onboarding prompts)

    **Headers:** `X-Device-ID: <device-id>`

    - input:

    ```json
        {
        "dietary_restrictions": ["Vegan", "Gluten-free"],
        "allergies": ["Peanuts"],
        "pantry_staples": ["Olive oil", "Garlic", "Rice"]
        }

        {
        "message": "Onboarding Complete"
        }
    ```
