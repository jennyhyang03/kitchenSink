'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useKitchenStore } from '@/store/kitchenStore'
import StepProgress from '@/components/StepProgress'
import { saveRecipe, logCooked } from '@/lib/api'

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="text-3xl transition-transform hover:scale-110">
          {star <= (hovered || value) ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  )
}

export default function RecipeDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { recipes, savedRecipeIds, addSavedRecipeId, removeSavedRecipeId, cookedLog, addCookedLog } = useKitchenStore()
  const recipe = recipes.find(r => r.id === id)
  const [saving, setSaving] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [rating, setRating] = useState(0)
  const [logging, setLogging] = useState(false)
  const [loggedSuccess, setLoggedSuccess] = useState(false)

  if (!recipe) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 mb-4">Recipe not found</p>
        <button onClick={() => router.push('/recipes')}
          className="text-green-500 hover:text-green-600 font-medium">
          ← Back to recipes
        </button>
      </div>
    </main>
  )

  const isSaved = savedRecipeIds.includes(recipe.id)
  const existingLog = cookedLog.find(l => l.recipeId === recipe.id)

  const difficultyColor = {
    Easy: 'bg-green-100 text-green-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Hard: 'bg-red-100 text-red-700',
  }[recipe.difficulty]

  const defaultTooltip = {
    Easy: '✅ You have all the ingredients needed.',
    Medium: `⚠️ Missing ${recipe.missingIngredients.length} ingredient${recipe.missingIngredients.length !== 1 ? 's' : ''}: ${recipe.missingIngredients.slice(0, 3).join(', ')}${recipe.missingIngredients.length > 3 ? '...' : ''}`,
    Hard: `❌ Missing ${recipe.missingIngredients.length} ingredients: ${recipe.missingIngredients.slice(0, 3).join(', ')}${recipe.missingIngredients.length > 3 ? ' and more...' : ''}`,
  }[recipe.difficulty]

  const tooltip = recipe.difficulty_reasoning ?? defaultTooltip

  const handleSave = async () => {
    setSaving(true)
    try {
      if (isSaved) {
        removeSavedRecipeId(recipe.id)
      } else {
        await saveRecipe(recipe.id)
        addSavedRecipeId(recipe.id)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleLogCooked = async () => {
    if (rating === 0) return
    setLogging(true)
    try {
      await logCooked(recipe.id)
      addCookedLog(recipe.id, rating)
      setLoggedSuccess(true)
      setShowRatingModal(false)
      setTimeout(() => setLoggedSuccess(false), 3000)
    } finally {
      setLogging(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">

        {/* rating modal */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <h3 className="font-bold text-gray-900 text-lg text-center mb-1">How was it?</h3>
              <p className="text-gray-400 text-sm text-center mb-5">Rate <span className="font-medium text-gray-600">{recipe.name}</span></p>
              <StarRating value={rating} onChange={setRating} />
              {rating > 0 && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  {['', 'Not great 😕', 'It was okay 😐', 'Pretty good 😊', 'Really good! 😄', 'Amazing! 🤩'][rating]}
                </p>
              )}
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowRatingModal(false); setRating(0) }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleLogCooked} disabled={rating === 0 || logging}
                  className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold transition-colors">
                  {logging ? 'Logging...' : 'Log It!'}
                </button>
              </div>
            </div>
          </div>
        )}

        <button onClick={() => router.push('/recipes')}
          className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1">
          ← Back to recipes
        </button>

        <StepProgress current={3} />

        {/* header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex justify-between items-start mb-2">
            <h1 className="font-bold text-2xl text-gray-900">{recipe.name}</h1>
            <div className="relative group">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full cursor-help ${difficultyColor}`}>
                {recipe.difficulty}
              </span>
              <div className="absolute right-0 top-7 z-10 hidden group-hover:block w-52 bg-gray-800 text-white text-xs rounded-xl p-3 shadow-lg">
                {tooltip}
              </div>
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-4">{recipe.description}</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>⏱ {recipe.time}</span>
            <span>✅ {recipe.matchedIngredients.length} ingredients matched</span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Ingredient match</span>
              <span className="font-semibold text-cyan-600">{recipe.matchScore}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${recipe.matchScore}%` }} />
            </div>
          </div>

          {/* save + log buttons */}
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all
                ${isSaved
                  ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-600'}`}>
              {isSaved ? '⭐ Saved' : '☆ Save Recipe'}
            </button>
            <button
              onClick={() => existingLog ? null : setShowRatingModal(true)}
              disabled={loggedSuccess}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${existingLog
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-green-500 hover:bg-green-600 text-white'}`}>
              {existingLog
                ? `✅ Cooked · ${'⭐'.repeat(existingLog.rating)}`
                : loggedSuccess ? '✅ Logged!' : '🍳 I Cooked This'}
            </button>
          </div>
        </div>

        {/* ingredients */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="font-bold text-gray-800 mb-4">Ingredients</h2>
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">You have</p>
            <div className="flex flex-wrap gap-2">
              {recipe.matchedIngredients.map(i => (
                <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">{i}</span>
              ))}
            </div>
          </div>
          {recipe.missingIngredients.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">You still need</p>
              <div className="flex flex-wrap gap-2">
                {recipe.missingIngredients.map(i => (
                  <span key={i} className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm">{i}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* substitutions */}
        {recipe.substitutions && recipe.substitutions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <h2 className="font-bold text-gray-800 mb-4">🔄 Substitutions</h2>
            <div className="flex flex-col gap-3">
              {recipe.substitutions.map((sub, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-700">{sub.ingredient}</span>
                      <span className="text-gray-400 text-xs">→</span>
                      <span className="text-sm font-semibold text-amber-700">{sub.substitute}</span>
                    </div>
                    {sub.note && (
                      <p className="text-xs text-gray-500 mt-1">{sub.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* instructions */}
        {recipe.instructions && recipe.instructions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <h2 className="font-bold text-gray-800 mb-4">Instructions</h2>
            <ol className="flex flex-col gap-4">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-4 text-sm text-gray-600">
                  <span className="w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* source */}
        {recipe.sourceUrl ? (
          <div className="mt-4 text-center">
            <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 font-medium border border-cyan-200 px-4 py-2 rounded-xl hover:bg-cyan-50 transition-colors">
              🔗 View Full Recipe Source
            </a>
          </div>
        ) : (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">Recipe sourced from MealDB / Spoonacular database</p>
          </div>
        )}

        {/* profile link — shown after saving or logging */}
        {(isSaved || existingLog) && (
          <button onClick={() => router.push('/profile')}
            className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
            👤 View My Profile →
          </button>
        )}

      </div>
    </main>
  )
}