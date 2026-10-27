import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { useAuth } from './useAuth'
import type { MealLogWithFood, MealType } from '../types/domain'

interface CopyMealLogsInput {
  logs: MealLogWithFood[]
  mealType: MealType
}

/** Logs the same foods and amounts again, now — e.g. "same breakfast as yesterday". */
export function useCopyMealLogs() {
  const { session } = useAuth()
  const userId = session?.user.id as string
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ logs, mealType }: CopyMealLogsInput) => {
      const { error } = await supabase.from('meal_logs').insert(
        logs.map((log) => ({
          user_id: userId,
          food_item_id: log.food_item_id,
          amount_g: log.amount_g,
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
