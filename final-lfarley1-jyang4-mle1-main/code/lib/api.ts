export interface Recipe {
  id: string
  name: string
  sourceUrl?: string
  matchedIngredients: string[]
  missingIngredients: string[]
  time: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  difficulty_reasoning?: string
  matchScore: number
  instructions?: string[]
  substitutions?: { ingredient: string; substitute: string; note?: string }[]
  rawIngredients?: { name: string; amount: string }[]
  description?: string; 
}

export interface OnboardingOptions {
    dietary_restrictions: string[]
    allergies: string[]
    pantry_staples: string[]
    user_skill: { value: string; description: string }[]
}

export interface OnboardingPayload {
  dietary_restrictions: string[]
  allergies: string[]
  pantry_staples: string[]
  user_skill?: string
}

//const BASE_URL = 'https://kitchen-sink1.onrender.com'
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

// generates or retrieves a persistent device ID
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'ssr-device'
  let id = localStorage.getItem('device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('device_id', id)
  }
  return id
}

function headers() {
  return {
    'Content-Type': 'application/json',
    'X-Device-ID': getDeviceId(),
  }
}

// ── Onboarding ───────────────────────────────────────────────────
export async function getOnboardingOptions(): Promise<OnboardingOptions> {
  const res = await fetch(`${BASE_URL}/onboarding/options`)
  return res.json()
}

export async function submitOnboarding(payload: OnboardingPayload): Promise<void> {
  await fetch(`${BASE_URL}/onboarding`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  })
}

// ── Fridge / Ingredients ─────────────────────────────────────────
export async function identifyIngredients(images: File[]): Promise<string[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 2000))
    return ['chicken breast', 'garlic', 'olive oil', 'lemon', 'rosemary', 'butter', 'onion', 'tomatoes']
  }
  const allIngredients: string[] = []
  for (const image of images) {
    const form = new FormData()
    form.append('file', image)
    const res = await fetch(`${BASE_URL}/fridge/analyze`, {
      method: 'POST',
      headers: { 'X-Device-ID': getDeviceId() },
      body: form,
    })
    const data = await res.json()
    const ingredients: string[] = data.ingredients ?? []
    // merge, avoiding duplicates
    ingredients.forEach(i => {
      if (!allIngredients.includes(i)) allIngredients.push(i)
    })
  }
  return allIngredients
}

// ── Recipes ──────────────────────────────────────────────────────
export async function generateRecipes(ingredients: string[],
  dietary_restrictions: string[] = [],
  allergies: string[] = [],
  meal_type: string = 'any', seenRecipeIds: string[] = []): Promise<Recipe[]> {
  const res = await fetch(`${BASE_URL}/recipes/generate`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      ingredients,
      meal_type,
      dietary_restrictions,
      allergies,
      exclude_ids: seenRecipeIds,
    }),
  })
  const data = await res.json()
  console.log('backend response:', data)

  if (!data.recipes) {
  console.error('Backend did not return recipes:', data)
  return []
  }
  const userIngredients = ingredients.map(i => i.toLowerCase())

  return data.recipes.map((r: any) => {
    // parse HTML instructions into steps
    const instructionSteps = Array.isArray(r.instructions)
    ? r.instructions  // already an array of steps, use directly
    : r.instructions
        ? r.instructions
            .replace(/<[^>]+>/g, '')
            .split(/(?<=[.!?])\s+/)
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 10)
        : []

    // figure out matched vs missing from user's ingredients
    const recipeIngredientNames = (r.ingredients || []).map((i: any) => 
    typeof i === 'string' ? i.toLowerCase() : (i.name || "").toLowerCase())
    const matched = recipeIngredientNames.filter((name: string) =>
      userIngredients.some(u => name.includes(u) || u.includes(name))
    )
    const missing = recipeIngredientNames.filter((name: string) =>
      !userIngredients.some(u => name.includes(u) || u.includes(name))
    )
    const matchScore = recipeIngredientNames.length > 0
      ? Math.round((matched.length / recipeIngredientNames.length) * 100)
      : 0

    return {
      id: String(r.id ?? r.name.replace(/\s+/g, '-').toLowerCase()),
      name: r.name,
      description: `A delicious recipe using ${matched.slice(0, 3).join(', ')}.`,
      matchedIngredients: matched,
      missingIngredients: missing,
      sourceUrl: r.sourceUrl ?? r.spoonacularSourceUrl ?? r.source_url ?? null,
      time: r.estimated_time
      ? `${r.estimated_time} min`
      : r.prep_time_minutes
      ? `${r.prep_time_minutes} min`
      : r.cook_time_minutes
      ? `${r.cook_time_minutes} min`
      : 'Time varies',
      difficulty: r.difficulty, 
      // difficulty: missing.length === 0 ? 'Easy' : missing.length <= 2 ? 'Medium' : 'Hard',
      difficulty_reasoning: r.difficulty_reasoning ?? null,
      matchScore,
      instructions: instructionSteps,
      substitutions: r.substitutions
      ? Object.entries(r.substitutions).map(([ingredient, substitute]) => ({
      ingredient,
      substitute: substitute as string,
      }))
      : [],
      rawIngredients: r.ingredients,
    }
  })
}

// ── Saved Recipes ─────────────────────────────────────────────
export async function saveRecipe(recipeId: string): Promise<void> {
  if (USE_MOCK) { await new Promise(r => setTimeout(r, 300)); return }
  await fetch(`${BASE_URL}/saved-recipes/save-recipe`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ recipe_id: recipeId }),
  })
}

export async function getSavedRecipes(): Promise<any[]> {
  if (USE_MOCK) return []
  const res = await fetch(`${BASE_URL}/saved-recipes/`, {
    headers: { 'X-Device-ID': getDeviceId() },
  })
  return res.json()
}

// ── Cooked Log ────────────────────────────────────────────────
export async function logCooked(recipeId: string): Promise<void> {
  if (USE_MOCK) { await new Promise(r => setTimeout(r, 300)); return }
  await fetch(`${BASE_URL}/cooked/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ recipe_id: recipeId }),
  })
}

export async function getCookedHistory(): Promise<any[]> {
  if (USE_MOCK) return []
  const res = await fetch(`${BASE_URL}/cooked/`, {
    headers: { 'X-Device-ID': getDeviceId() },
  })
  return res.json()
}






