'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StepProgress from '@/components/StepProgress'
import RecipeCard from '@/components/RecipeCard'
import LoadingScreen from '@/components/LoadingScreen'
import { useKitchenStore } from '@/store/kitchenStore'
import { generateRecipes } from '@/lib/api'

export default function RecipesPage() {
  const router = useRouter()
  const { recipes, reset, ingredients, dietary_restrictions, allergies, mealType, seenRecipeIds, setRecipes } = useKitchenStore()
  const [loading, setLoading] = useState(false)

  const handleStartOver = () => {
    reset()
    router.push('/')
  }

  const handleRegenerate = async () => {
    setLoading(true)
    try {
      const newRecipes = await generateRecipes(
        ingredients,
        dietary_restrictions,
        allergies,
        mealType,
        seenRecipeIds
      )
      setRecipes(newRecipes)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingScreen message="Finding new recipes..." />

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">🍳 KitchenSink</h1>
          <p className="text-gray-500 mt-2">Turn your fridge into a recipe book</p>
        </div>
        <StepProgress current={3} />
        <div className="mb-4 flex justify-between items-center">
          <h2 className="font-semibold text-gray-700">{recipes.length} Recipes Found</h2>
          <button onClick={() => router.push('/ingredients')}
            className="text-sm text-gray-400 hover:text-gray-600">
            ← Edit ingredients
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {recipes.map((recipe, index) => (
            <RecipeCard key={recipe.id ?? index} recipe={recipe} />
          ))}
        </div>

        {/* regenerate + session log */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-sm font-semibold text-gray-700">Don't like these?</p>
              <p className="text-xs text-gray-400">
                {seenRecipeIds.length} recipe{seenRecipeIds.length !== 1 ? 's' : ''} seen this session
              </p>
            </div>
            <button
              onClick={handleRegenerate}
              className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              🔄 Regenerate
            </button>
          </div>
        </div>

        <button onClick={handleStartOver}
          className="w-full mt-3 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 rounded-xl transition-colors">
          Start Over
        </button>
      </div>
    </main>
  )
}