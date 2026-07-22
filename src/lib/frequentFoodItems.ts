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

/** Log count per "source:externalId", for ranking search results by how often
 * the user has actually logged that specific food before — e.g. searching
 * "kvarg" should surface their usual brand over one they've never picked. */
export function foodItemFrequencyMap(logs: MealLogWithFood[]): Map<string, number> {
  const counts = new Map<string, number>()

  for (const log of logs) {
    const key = `${log.food_item.source}:${log.food_item.external_id}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return counts
}

/** Grams last logged for each food ("source:externalId" → amount_g), from the
 * most recent log — logs is already newest-first, so the first occurrence of a
 * key wins. Used to seed the amount picker with what the user actually ate last
 * time, instead of a fixed default. */
export function lastLoggedAmountMap(logs: MealLogWithFood[]): Map<string, number> {
  const map = new Map<string, number>()

  for (const log of logs) {
    const key = `${log.food_item.source}:${log.food_item.external_id}`
    if (!map.has(key)) map.set(key, log.amount_g)
  }

  return map
}
