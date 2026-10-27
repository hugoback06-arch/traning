import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys'
import { fetchFoodLogHistory } from '../lib/foodLogHistory'
import { recentFoodItems } from '../lib/frequentFoodItems'
import { useAuth } from './useAuth'

const RESULT_LIMIT = 10

export function useRecentFoodItems() {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: queryKeys.frequentFoodItems(userId),
    queryFn: () => fetchFoodLogHistory(userId as string),
    enabled: !!userId,
    select: (logs) => recentFoodItems(logs, RESULT_LIMIT),
  })
}
