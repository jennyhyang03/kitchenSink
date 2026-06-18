import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Recipe, OnboardingPayload } from '@/lib/api'

interface KitchenStore {
  onboardingComplete: boolean
  dietary_restrictions: string[]
  allergies: string[]
  pantry_staples: string[]
  user_skill: string
  images: File[]
  imagePreviews: string[]
  ingredients: string[]
  recipes: Recipe[]
  seenRecipeIds: string[]
  mealType: string
  savedRecipeIds: string[]
  cookedLog: { recipeId: string; rating: number; cookedAt: string }[]
  completeOnboarding: (payload: OnboardingPayload) => void
  addImages: (files: File[]) => void
  removeImage: (index: number) => void
  clearImages: () => void
  setIngredients: (items: string[]) => void
  setRecipes: (recipes: Recipe[]) => void
  addSeenRecipeIds: (ids: string[]) => void
  addCookedLog: (recipeId: string, rating: number) => void
  setMealType: (type: string) => void
  addSavedRecipeId: (id: string) => void
  removeSavedRecipeId: (id: string) => void
  reset: () => void
  
}

export const useKitchenStore = create<KitchenStore>()(
  persist(
    (set) => ({
      onboardingComplete: false,
      dietary_restrictions: [],
      allergies: [],
      pantry_staples: [],
      user_skill: '',
      images: [],
      imagePreviews: [],
      ingredients: [],
      recipes: [],
      seenRecipeIds: [],
      mealType: 'any',
      completeOnboarding: (payload) => set({
        onboardingComplete: true,
        dietary_restrictions: payload.dietary_restrictions,
        allergies: payload.allergies,
        pantry_staples: payload.pantry_staples,
        user_skill: payload.user_skill ?? '',
      }),
      addImages: (files: File[]) => set((state) => ({
        images: [...state.images, ...files],
        imagePreviews: [
        ...state.imagePreviews,
        ...files.map(f => URL.createObjectURL(f))
      ]
      })),
      removeImage: (index: number) => set((state) => ({
        images: state.images.filter((_, i) => i !== index),
        imagePreviews: state.imagePreviews.filter((_, i) => i !== index),
      })),
      clearImages: () => set({ images: [], imagePreviews: [] }),
      setIngredients: (items) => set({ ingredients: items }),
      setRecipes: (recipes) => set((state) => ({
        recipes,
        seenRecipeIds: [
          ...state.seenRecipeIds,
          ...recipes.map(r => r.id).filter(id => !state.seenRecipeIds.includes(id))
        ]
      })),
      savedRecipeIds: [],
      addSavedRecipeId: (id) => set((state) => ({
        savedRecipeIds: [...state.savedRecipeIds, id]
      })),
      removeSavedRecipeId: (id) => set((state) => ({
        savedRecipeIds: state.savedRecipeIds.filter(s => s !== id)
      })),
      addSeenRecipeIds: (ids) => set((state) => ({
        seenRecipeIds: [...new Set([...state.seenRecipeIds, ...ids])]
      })),
      cookedLog: [],
      addCookedLog: (recipeId, rating) => set((state) => ({
        cookedLog: [
        ...state.cookedLog.filter(l => l.recipeId !== recipeId),
        { recipeId, rating, cookedAt: new Date().toISOString() }
        ]
      })),
      setMealType: (type) => set({ mealType: type }),
      reset: () => set({ 
        images: [], 
        imagePreviews: [], 
        ingredients: [], 
        recipes: [], 
        seenRecipeIds: [], 
        mealType: 'any' }),
    }),
    
    {
      name: 'kitchen-store',
      partialize: (state) => ({
        onboardingComplete: state.onboardingComplete,
        dietary_restrictions: state.dietary_restrictions,
        allergies: state.allergies,
        pantry_staples: state.pantry_staples,
        user_skill: state.user_skill,
        //imagePreviews: state.imagePreviews,
        ingredients: state.ingredients,
        recipes: state.recipes,
        seenRecipeIds: state.seenRecipeIds,
        mealType: state.mealType,
        savedRecipeIds: state.savedRecipeIds,
        cookedLog: state.cookedLog,
      }),
    }
  )
)