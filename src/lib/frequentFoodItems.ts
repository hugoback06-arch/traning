import type { FoodItem, MealLogWithFood } from '../types/domain'

/** Foods logged at least twice in the given history, most-logged first
 * (ties broken by most recently logged) — the "you usually eat this" set. */
export function topFrequentFoodItems(logs: MealLogWithFood[], limit: number): FoodItem[] {
  const counts = new Map<string, { item: FoodItem; count: number; lastLoggedAt: string }>()

  for (const log of logs) {
    const existing = counts.get(log.food_item_id)
    if (existing) {
      existing.count += 1
      if (log.logged_at > existing.lastLoggedAt) existing.lastLoggedAt = log.logged_at
    } else {
      counts.set(log.food_item_id, { item: log.food_item, count: 1, lastLoggedAt: log.logged_at })
    }
  }

  return Array.from(counts.values())
    .filter((entry) => entry.count >= 2)
    .sort((a, b) => b.count - a.count || (a.lastLoggedAt < b.lastLoggedAt ? 1 : -1))
    .slice(0, limit)
    .map((entry) => entry.item)
}
