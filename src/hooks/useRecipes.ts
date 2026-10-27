import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { toFunctionError } from '../lib/functionError'
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
  remaining?: { kcal: number; proteinG: number }
}

// Generated recipes live in the query cache (not refetched on their own) so
// switching tabs or leaving the page doesn't throw away — and re-pay for — a batch.
export function useGeneratedRecipes(mealType: RecipeMealType) {
  return useQuery({
    queryKey: queryKeys.generatedRecipes(mealType),
    queryFn: () => [] as Recipe[],
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

export function useGenerateRecipes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: GenerateRecipesInput): Promise<Recipe[]> => {
      const previous = queryClient.getQueryData<Recipe[]>(queryKeys.generatedRecipes(input.mealType)) ?? []
      const { data, error } = await supabase.functions.invoke<{ recipes: Recipe[] }>('generate-recipes', {
        body: { ...input, exclude: previous.map((recipe) => recipe.title) },
      })
      if (error) throw await toFunctionError(error, 'Kunde inte ta fram recept')
      if (!data?.recipes) throw new Error('Kunde inte ta fram recept')
      return data.recipes
    },
    onSuccess: (recipes, input) => {
      queryClient.setQueryData(queryKeys.generatedRecipes(input.mealType), recipes)
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
