import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys'
import { createSavedMeal } from '../lib/savedMeals'
import { findOrCreateFoodItem } from '../lib/foodItems'
import { useAuth } from './useAuth'
import type { FoodSearchResult } from '../types/domain'

interface SaveMealFromSearchInput {
  name: string
  items: { foodResult: FoodSearchResult; amountG: number }[]
}

/** For the from-scratch builder, where items are still search results and not
 * yet food_items rows — resolves each via findOrCreateFoodItem first, same as
 * useLogMeal does for a single item. */
export function useSaveMealFromSearchResults() {
  const { session } = useAuth()
  const userId = session?.user.id as string
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ name, items }: SaveMealFromSearchInput) => {
      const resolved = await Promise.all(
        items.map(async (item) => ({
          foodItemId: (await findOrCreateFoodItem(item.foodResult, userId)).id,
          amountG: item.amountG,
        })),
      )
      return createSavedMeal(userId, name, resolved)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedMeals(userId) })
    },
  })
}
