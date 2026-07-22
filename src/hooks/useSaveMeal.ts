import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys'
import { createSavedMeal } from '../lib/savedMeals'
import { useAuth } from './useAuth'

interface SaveMealInput {
  name: string
  items: { foodItemId: string; amountG: number }[]
}

/** For flows where food_item_id is already known (e.g. saving an already-logged
 * meal-type group) — no findOrCreateFoodItem resolution needed. */
export function useSaveMeal() {
  const { session } = useAuth()
  const userId = session?.user.id as string
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ name, items }: SaveMealInput) => createSavedMeal(userId, name, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedMeals(userId) })
    },
  })
}
