'use client'
import { useRouter } from 'next/navigation'
import { Recipe } from '@/lib/api'

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const router = useRouter()

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

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-shadow hover:shadow-md cursor-pointer"
      onClick={() => router.push(`/recipes/${recipe.id}`)}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800">{recipe.name}</h3>
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
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Ingredient match</span>
            <span className="font-semibold text-cyan-600">{recipe.matchScore}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${recipe.matchScore}%` }} />
          </div>
        </div>
        <div className="flex gap-4 text-xs text-gray-500">
          <span>⏱ {recipe.time}</span>
          <span>✅ {recipe.matchedIngredients.length} matched</span>
          {recipe.missingIngredients.length > 0 && (
            <span>🛒 {recipe.missingIngredients.length} missing</span>
          )}
          {recipe.substitutions && recipe.substitutions.length > 0 && (
            <span>🔄 {recipe.substitutions.length} sub{recipe.substitutions.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </div>
  )
}