import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys'
import { fetchFoodLogHistory } from '../lib/foodLogHistory'
import { foodItemFrequencyMap } from '../lib/frequentFoodItems'
import { useAuth } from './useAuth'

// Shares its query key with useFrequentFoodItems (QuickFoodPicks) — same
// underlying log history, just a different `select` — so switching between
// the "choose" and "search" steps of AddMealModal doesn't refetch.
export function useFoodItemFrequencyMap() {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: queryKeys.frequentFoodItems(userId),
    queryFn: () => fetchFoodLogHistory(userId as string),
    enabled: !!userId,
    select: foodItemFrequencyMap,
  })
}
