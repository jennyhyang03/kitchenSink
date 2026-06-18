'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/ImageUpload'
import StepProgress from '@/components/StepProgress'
import { useKitchenStore } from '@/store/kitchenStore'
import { identifyIngredients } from '@/lib/api'
import LoadingScreen from '@/components/LoadingScreen'

export default function Home() {
  const router = useRouter()
  const { images, imagePreviews, addImages, removeImage, clearImages, setIngredients, onboardingComplete } = useKitchenStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!onboardingComplete) router.push('/onboarding')
      clearImages()
  }, [onboardingComplete])

  const handleAnalyze = async () => {
    if (images.length === 0) return
    setLoading(true)
    setError('')
    try {
      const ingredients = await identifyIngredients(images)
      setIngredients(ingredients)
      router.push('/ingredients')
    } catch {
      setError('Failed to analyze image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingScreen message="Analyzing your fridge..." />

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">🍳 KitchenSink</h1>
          <p className="text-gray-500 mt-2">Turn your fridge into a recipe book</p>
        </div>
        <StepProgress current={1} />  {/* or current 0 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Upload photos of your fridge or pantry</h2>
          <ImageUpload
            onFiles={addImages}
            previews={imagePreviews}
            onRemove={removeImage}
          />
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          <button onClick={handleAnalyze} disabled={images.length === 0 || loading}
            className="w-full mt-6 bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400
              text-white font-semibold py-3 rounded-xl transition-colors">
            {loading ? 'Analyzing...' : `Identify Ingredients from ${images.length} photo${images.length !== 1 ? 's' : ''} →`}
          </button>
        </div>
        <button onClick={() => router.push('/onboarding')}
          className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 py-2 text-center">
          ⚙️ Edit preferences
        </button>
        <button onClick={() => router.push('/profile')}
          className="flex-1 text-sm text-gray-400 hover:text-gray-600 py-2 text-center">
          👤 My Profile
        </button>

      </div>
    </main>
  )
}