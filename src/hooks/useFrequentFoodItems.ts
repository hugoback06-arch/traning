import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { topFrequentFoodItems } from '../lib/frequentFoodItems'
import { useAuth } from './useAuth'
import type { MealLogWithFood } from '../types/domain'

const HISTORY_LIMIT = 300
const RESULT_LIMIT = 6

export function useFrequentFoodItems() {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: queryKeys.frequentFoodItems(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meal_logs')
        .select('*, food_item:food_items(*)')
        .eq('user_id', userId as string)
        .order('logged_at', { ascending: false })
        .limit(HISTORY_LIMIT)

      if (error) throw error
      return topFrequentFoodItems(data as unknown as MealLogWithFood[], RESULT_LIMIT)
    },
    enabled: !!userId,
  })
}
