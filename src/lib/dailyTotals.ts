import type { MealLogWithFood } from '../types/domain'

export interface DailyTotals {
  kcal: number
  proteinG: number
  carbsG: number
  fatG: number
}

export function sumMealTotals(logs: MealLogWithFood[]): DailyTotals {
  return logs.reduce<DailyTotals>(
    (acc, log) => {
      const factor = log.amount_g / 100
      acc.kcal += log.food_item.calories_per_100g * factor
      acc.proteinG += log.food_item.protein_per_100g * factor
      acc.carbsG += log.food_item.carbs_per_100g * factor
      acc.fatG += log.food_item.fat_per_100g * factor
      return acc
    },
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  )
}
