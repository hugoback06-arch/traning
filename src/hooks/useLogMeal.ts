import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { findOrCreateFoodItem } from '../lib/foodItems'
import { useAuth } from './useAuth'
import type { FoodSearchResult, MealType } from '../types/domain'

interface LogMealInput {
  foodResult: FoodSearchResult
  amountG: number
  mealType: MealType
}

export function useLogMeal() {
  const { session } = useAuth()
  const userId = session?.user.id as string
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ foodResult, amountG, mealType }: LogMealInput) => {
      const foodItem = await findOrCreateFoodItem(foodResult, userId)
      const { error } = await supabase.from('meal_logs').insert({
        user_id: userId,
        food_item_id: foodItem.id,
        amount_g: amountG,
        meal_type: mealType,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mealLogsPrefix })
    },
  })
}
