import type { ActivityLevel, Sex, WeightGoal } from '../types/domain'

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

const GOAL_CALORIE_ADJUSTMENT: Record<WeightGoal, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
}

const SEX_BMR_OFFSET: Record<Sex, number> = {
  male: 5,
  female: -161,
  other: -78, // midpoint of the male/female offsets
}

const MIN_DAILY_CALORIES = 1200

const MACRO_SPLIT = { protein: 0.3, carbs: 0.4, fat: 0.3 }
const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 }

export interface CalorieCalcInput {
  sex: Sex
  weightKg: number
  heightCm: number
  age: number
  activityLevel: ActivityLevel
  goal: WeightGoal
}

export interface CalorieCalcResult {
  bmr: number
  tdee: number
  dailyCalorieGoal: number
  proteinGoalG: number
  carbsGoalG: number
  fatGoalG: number
}

export function calculateCalorieGoals(input: CalorieCalcInput): CalorieCalcResult {
  const bmr = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age + SEX_BMR_OFFSET[input.sex]
  const tdee = bmr * ACTIVITY_FACTORS[input.activityLevel]
  const dailyCalorieGoal = Math.max(
    MIN_DAILY_CALORIES,
    Math.round(tdee + GOAL_CALORIE_ADJUSTMENT[input.goal]),
  )

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    dailyCalorieGoal,
    proteinGoalG: Math.round((dailyCalorieGoal * MACRO_SPLIT.protein) / KCAL_PER_G.protein),
    carbsGoalG: Math.round((dailyCalorieGoal * MACRO_SPLIT.carbs) / KCAL_PER_G.carbs),
    fatGoalG: Math.round((dailyCalorieGoal * MACRO_SPLIT.fat) / KCAL_PER_G.fat),
  }
}
