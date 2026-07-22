import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { useAuth } from './useAuth'
import type { MealType, SavedMealWithItems } from '../types/domain'

interface LogSavedMealInput {
  savedMeal: SavedMealWithItems
  mealType: MealType
}

export function useLogSavedMeal() {
  const { session } = useAuth()
  const userId = session?.user.id as string
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ savedMeal, mealType }: LogSavedMealInput) => {
      const { error } = await supabase.from('meal_logs').insert(
        savedMeal.items.map((item) => ({
          user_id: userId,
          food_item_id: item.food_item_id,
          amount_g: item.amount_g,
          meal_type: mealType,
        })),
      )
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mealLogsPrefix })
    },
  })
}
