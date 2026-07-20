import type { MealType } from '../types/domain'

export function getActiveMealType(date: Date = new Date()): MealType {
  const h = date.getHours() + date.getMinutes() / 60
  if (h >= 5 && h < 10.5) return 'breakfast'
  if (h >= 10.5 && h < 14) return 'lunch'
  if (h >= 14 && h < 17) return 'snack'
  if (h >= 17 && h < 22) return 'dinner'
  return 'snack'
}
