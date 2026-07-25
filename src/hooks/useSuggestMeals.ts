import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface MealSuggestion {
  name: string
  description: string
  kcal: number
  protein_g: number
  recipe_url: string
}

interface SuggestMealsResponse {
  suggestions: MealSuggestion[]
}

interface SuggestMealsErrorBody {
  error: string
  code?: string
}

interface SuggestMealsInput {
  remainingKcal: number
  remainingProteinG: number
  remainingCarbsG: number
  remainingFatG: number
}

export function useSuggestMeals() {
  return useMutation({
    mutationFn: async (input: SuggestMealsInput): Promise<MealSuggestion[]> => {
      const { data, error } = await supabase.functions.invoke<SuggestMealsResponse | SuggestMealsErrorBody>(
        'suggest-meals',
        { body: input },
      )

      if (error) throw error
      if (!data || 'error' in data) throw new Error(data?.error ?? 'Kunde inte ta fram förslag')
      return data.suggestions
    },
  })
}
