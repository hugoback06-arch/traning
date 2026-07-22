import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys'
import { fetchSavedMealsWithItems } from '../lib/savedMeals'
import { useAuth } from './useAuth'

export function useSavedMeals() {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: queryKeys.savedMeals(userId),
    queryFn: () => fetchSavedMealsWithItems(userId as string),
    enabled: !!userId,
  })
}
