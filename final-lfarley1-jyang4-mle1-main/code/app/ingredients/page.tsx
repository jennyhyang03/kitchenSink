'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StepProgress from '@/components/StepProgress'
import IngredientEditor from '@/components/IngredientEditor'
import { useKitchenStore } from '@/store/kitchenStore'
import { generateRecipes } from '@/lib/api'
import LoadingScreen from '@/components/LoadingScreen'

const MEAL_TYPES = [
  { label: '🍳 Breakfast', value: 'breakfast' },
  { label: '🥗 Lunch', value: 'lunch' },
  { label: '🍝 Dinner', value: 'dinner' },
  { label: '🍿 Snack', value: 'snack' },
  { label: '🍰 Dessert', value: 'dessert' },
  { label: '🍽️ Any', value: 'any' },
]

export default function IngredientsPage() {
  const router = useRouter()
  const {
    ingredients,
    setIngredients,
    setRecipes,
    imagePreviews,
    dietary_restrictions,
    allergies,
    seenRecipeIds,
    mealType,
    setMealType,
  } = useKitchenStore()
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const recipes = await generateRecipes(ingredients, dietary_restrictions, allergies, mealType, seenRecipeIds)
      setRecipes(recipes)
      router.push('/recipes')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingScreen message="Finding recipes for you..." />

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">🍳 KitchenSink</h1>
          <p className="text-gray-500 mt-2">Turn your fridge into a recipe book</p>
        </div>

        <StepProgress current={2} />

        {imagePreviews && imagePreviews.length > 0 ? (
          <div className="flex gap-4 mb-4 items-start">

            {/* left: fridge photos */}
            <div className="w-2/5 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Your Fridge</p>
                <div className="flex flex-col gap-2">
                  {imagePreviews.map((src, i) => (
                    <img key={i} src={src} alt={`Fridge ${i + 1}`}
                      className="w-full rounded-xl object-cover max-h-40" />
                  ))}
                </div>
              </div>
            </div>

            {/* right: meal type + ingredients */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h2 className="font-semibold text-gray-700 mb-3 text-sm">What meal are you making?</h2>
                <div className="flex flex-wrap gap-1.5">
                  {MEAL_TYPES.map(({ label, value }) => (
                    <button key={value} onClick={() => setMealType(value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                        ${mealType === value
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-amber-400'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-gray-700 text-sm">Detected Ingredients</h2>
                  <span className="text-xs text-gray-400">{ingredients.length} items</span>
                </div>
                <IngredientEditor ingredients={ingredients} onChange={setIngredients} />
                <div className="flex gap-2 mt-4">
                  <button onClick={() => router.push('/')}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium transition-colors">
                    ← Back
                  </button>
                  <button onClick={handleGenerate} disabled={ingredients.length === 0 || loading}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400
                      text-white font-semibold py-2 rounded-xl transition-colors text-sm">
                    {loading ? 'Finding recipes...' : 'Generate Recipes →'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-700 mb-3">What meal are you making?</h2>
              <div className="flex flex-wrap gap-2">
                {MEAL_TYPES.map(({ label, value }) => (
                  <button key={value} onClick={() => setMealType(value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all
                      ${mealType === value
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-amber-400'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-700">Detected Ingredients</h2>
                <span className="text-sm text-gray-400">{ingredients.length} items</span>
              </div>
              <IngredientEditor ingredients={ingredients} onChange={setIngredients} />
              <div className="flex gap-3 mt-6">
                <button onClick={() => router.push('/')}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
                  ← Back
                </button>
                <button onClick={handleGenerate} disabled={ingredients.length === 0 || loading}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400
                    text-white font-semibold py-3 rounded-xl transition-colors">
                  {loading ? 'Finding recipes...' : 'Generate Recipes →'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}