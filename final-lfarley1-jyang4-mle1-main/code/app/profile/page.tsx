'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSavedRecipes } from '@/lib/api'
import { useKitchenStore } from '@/store/kitchenStore'

export default function ProfilePage() {
  const router = useRouter()
  const { savedRecipeIds, recipes, cookedLog } = useKitchenStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSavedRecipes().finally(() => setLoading(false))
  }, [])

  const localSavedRecipes = recipes.filter(r => savedRecipeIds.includes(r.id))
  const sortedLog = [...cookedLog].sort((a, b) =>
    new Date(b.cookedAt).getTime() - new Date(a.cookedAt).getTime()
  )

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">🍳 KitchenSink</h1>
          <p className="text-gray-500 mt-2">Your cooking profile</p>
        </div>

        <button onClick={() => router.back()}
          className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1">
          ← Back
        </button>

        {/* stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{localSavedRecipes.length}</p>
            <p className="text-xs text-gray-400 mt-1">Saved</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{cookedLog.length}</p>
            <p className="text-xs text-gray-400 mt-1">Cooked</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-cyan-500">
              {cookedLog.length > 0
                ? (cookedLog.reduce((sum, l) => sum + l.rating, 0) / cookedLog.length).toFixed(1)
                : '—'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Avg Rating</p>
          </div>
        </div>

        {/* saved recipes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="font-bold text-gray-800 text-lg mb-4">⭐ Saved Recipes</h2>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : localSavedRecipes.length > 0 ? (
            <div className="flex flex-col gap-3">
              {localSavedRecipes.map(recipe => (
                <div key={recipe.id}
                  onClick={() => router.push(`/recipes/${recipe.id}`)}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{recipe.name}</p>
                    <p className="text-xs text-gray-400">{recipe.time} · {recipe.difficulty}</p>
                  </div>
                  <span className="text-amber-500">⭐</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No saved recipes yet — save recipes from the recipe detail page.</p>
          )}
        </div>

        {/* cooking history */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="font-bold text-gray-800 text-lg mb-4">🍳 Cooking History</h2>
          {sortedLog.length > 0 ? (
            <div className="flex flex-col gap-3">
              {sortedLog.map((log, i) => {
                const recipe = recipes.find(r => r.id === log.recipeId)
                return (
                  <div key={i}
                    onClick={() => recipe && router.push(`/recipes/${recipe.id}`)}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-green-50 transition-colors">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{recipe?.name ?? 'Recipe'}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(log.cookedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{'⭐'.repeat(log.rating)}</p>
                      <p className="text-xs text-gray-400">{log.rating}/5</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No cooking history yet — log recipes after you cook them.</p>
          )}
        </div>

        <button onClick={() => router.push('/onboarding')}
          className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 rounded-xl transition-colors text-sm">
          ⚙️ Edit Preferences
        </button>

      </div>
    </main>
  )
}