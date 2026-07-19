import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import type { MealType } from '../types/domain'

interface UpdateMealLogInput {
  id: string
  amountG: number
  mealType: MealType
}

export function useUpdateMealLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, amountG, mealType }: UpdateMealLogInput) => {
      const { error } = await supabase
        .from('meal_logs')
        .update({ amount_g: amountG, meal_type: mealType })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mealLogsPrefix })
    },
  })
}
