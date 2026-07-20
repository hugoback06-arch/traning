import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { useAuth } from './useAuth'
import type { CalorieAdjustment } from '../types/domain'

export function useCalorieAdjustmentsForDate(date: Date) {
  const { session } = useAuth()
  const userId = session?.user.id
  const dateKey = format(date, 'yyyy-MM-dd')

  return useQuery({
    queryKey: queryKeys.calorieAdjustmentsForDate(userId, dateKey),
    queryFn: async (): Promise<CalorieAdjustment[]> => {
      const { data, error } = await supabase
        .from('calorie_adjustments')
        .select('*')
        .eq('user_id', userId as string)
        .eq('adjustment_date', dateKey)

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}
