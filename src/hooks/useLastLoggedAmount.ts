import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys'
import { fetchFoodLogHistory } from '../lib/foodLogHistory'
import { lastLoggedAmountMap } from '../lib/frequentFoodItems'
import { useAuth } from './useAuth'

// Shares its query key with useFrequentFoodItems / useFoodItemFrequencyMap —
// same underlying log history, different `select`, so no extra fetch.
export function useLastLoggedAmount() {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: queryKeys.frequentFoodItems(userId),
    queryFn: () => fetchFoodLogHistory(userId as string),
    enabled: !!userId,
    select: lastLoggedAmountMap,
  })
}
