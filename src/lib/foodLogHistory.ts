import { supabase } from './supabase'
import type { MealLogWithFood } from '../types/domain'

export const FOOD_LOG_HISTORY_LIMIT = 300

// Shared by useFrequentFoodItems (QuickFoodPicks) and useFoodItemFrequencyMap
// (search result ranking) — both derive different views from the same recent
// log history, so they share one query key/fetch and differ only by `select`.
export async function fetchFoodLogHistory(userId: string): Promise<MealLogWithFood[]> {
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*, food_item:food_items(*)')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(FOOD_LOG_HISTORY_LIMIT)

  if (error) throw error
  return data as unknown as MealLogWithFood[]
}
