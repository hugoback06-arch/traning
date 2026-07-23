import { Apple, EggFried, Sandwich, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import type { MealType } from '../types/domain'

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Frukost',
  lunch: 'Lunch',
  dinner: 'Middag',
  snack: 'Snacks',
}

export const MEAL_TYPE_ICONS: Record<MealType, LucideIcon> = {
  breakfast: EggFried,
  lunch: Sandwich,
  dinner: UtensilsCrossed,
  snack: Apple,
}

export const MEAL_TYPE_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
