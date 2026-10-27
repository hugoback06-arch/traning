import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { env } from '../lib/env'
import { queryKeys } from '../lib/queryKeys'
import { FunctionError } from '../lib/functionError'
import { useAuth } from './useAuth'
import type { MealEstimateIngredient } from './useAnalyzeMealPhoto'
import type { DietaryPreference } from '../types/domain'

export type RecipeMealType = 'breakfast' | 'lunch' | 'dinner'

export interface RecipeIngredient extends MealEstimateIngredient {
  amount: string
}

export interface Recipe {
  id: string
  meal_type: RecipeMealType
  title: string
  description: string
  time_minutes: number
  servings: number
  ingredients: RecipeIngredient[]
  steps: string[]
  tip: string
  per_serving: { weight_g: number; calories: number; protein_g: number; carbs_g: number; fat_g: number }
}

export interface SavedRecipe {
  id: string
  recipe: Recipe
  created_at: string
}

interface GenerateRecipesInput {
  mealType: RecipeMealType
  dietaryPreference: DietaryPreference
  wish?: string
  pantry?: string
  remaining?: { kcal: number; proteinG: number }
}

type RecipeStreamLine = { type: 'recipe'; recipe: Recipe } | { type: 'done' } | { type: 'error'; error: string }

// The latest batch per meal type is kept in localStorage too, so a reload
// doesn't throw away — and re-pay for — recipes the user hasn't saved.
function storageKey(userId: string, mealType: RecipeMealType) {
  return `strikt.generatedRecipes.${userId}.${mealType}`
}

function readStoredRecipes(userId: string, mealType: RecipeMealType): Recipe[] {
  try {
    const raw = localStorage.getItem(storageKey(userId, mealType))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStoredRecipes(userId: string, mealType: RecipeMealType, recipes: Recipe[]) {
  try {
    localStorage.setItem(storageKey(userId, mealType), JSON.stringify(recipes))
  } catch {
    // Storage full or blocked — the in-memory cache still works.
  }
}

export function useGeneratedRecipes(mealType: RecipeMealType) {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: queryKeys.generatedRecipes(userId, mealType),
    queryFn: () => readStoredRecipes(userId as string, mealType),
    enabled: !!userId,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

// generate-recipes streams NDJSON (one line per finished recipe), which
// supabase.functions.invoke can't hand over incrementally, so this calls the
// function URL directly with the user's token.
async function streamRecipes(body: unknown, onRecipe: (recipe: Recipe) => void): Promise<void> {
  const { data } = await supabase.auth.getSession()
  if (!data.session) throw new FunctionError('Du är inte inloggad', 'UNAUTHORIZED')

  const response = await fetch(`${env.VITE_SUPABASE_URL}/functions/v1/generate-recipes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      apikey: env.VITE_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!response.ok || !response.body) {
    const errorBody = await response.json().catch(() => null)
    throw new FunctionError(errorBody?.error ?? 'Kunde inte ta fram recept', errorBody?.code)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  const state = { received: 0, error: null as string | null }

  const handleLine = (line: string) => {
    if (!line.trim()) return
    const parsed = JSON.parse(line) as RecipeStreamLine
    if (parsed.type === 'recipe') {
      state.received++
      onRecipe(parsed.recipe)
    } else if (parsed.type === 'error') {
      state.error = parsed.error
    }
  }

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    lines.forEach(handleLine)
  }
  handleLine(buffer + decoder.decode())

  // A failure after some recipes arrived still leaves a usable batch.
  if (state.received === 0) throw new FunctionError(state.error ?? 'Kunde inte ta fram recept', 'RECIPE_API_ERROR')
}

export function useGenerateRecipes() {
  const { session } = useAuth()
  const userId = session?.user.id
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: GenerateRecipesInput): Promise<Recipe[]> => {
      const key = queryKeys.generatedRecipes(userId, input.mealType)
      const previous = queryClient.getQueryData<Recipe[]>(key) ?? []
      const batch: Recipe[] = []

      await streamRecipes({ ...input, exclude: previous.map((recipe) => recipe.title) }, (recipe) => {
        // The old batch stays visible until the first new recipe replaces it.
        batch.push(recipe)
        queryClient.setQueryData(key, [...batch])
        if (userId) writeStoredRecipes(userId, input.mealType, batch)
      })
      return batch
    },
  })
}

export function useSavedRecipes() {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: queryKeys.savedRecipes(userId),
    queryFn: async (): Promise<SavedRecipe[]> => {
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('id, recipe, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as SavedRecipe[]
    },
    enabled: !!userId,
  })
}

export function useSaveRecipe() {
  const { session } = useAuth()
  const userId = session?.user.id
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (recipe: Recipe) => {
      const { error } = await supabase.from('saved_recipes').insert({
        user_id: userId,
        title: recipe.title,
        meal_type: recipe.meal_type,
        recipe,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedRecipes(userId) })
    },
  })
}

export function useDeleteSavedRecipe() {
  const { session } = useAuth()
  const userId = session?.user.id
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (savedRecipeId: string) => {
      const { error } = await supabase.from('saved_recipes').delete().eq('id', savedRecipeId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedRecipes(userId) })
    },
  })
}
