export type Sex = 'male' | 'female' | 'other'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type WeightGoal = 'lose' | 'maintain' | 'gain'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type FoodSource = 'open_food_facts' | 'ai_estimate' | 'generic'

export interface Profile {
  id: string
  full_name: string | null
  birth_date: string | null
  sex: Sex | null
  height_cm: number | null
  weight_kg: number | null
  activity_level: ActivityLevel | null
  goal: WeightGoal | null
  daily_calorie_goal: number | null
  protein_goal_g: number | null
  carbs_goal_g: number | null
  fat_goal_g: number | null
  water_goal_ml: number
  onboarding_completed_at: string | null
  created_at: string
  updated_at: string
}

export interface FoodItem {
  id: string
  source: FoodSource
  external_id: string | null
  name: string
  brand: string | null
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  image_url: string | null
  created_by: string | null
  created_at: string
}

export interface MealLog {
  id: string
  user_id: string
  food_item_id: string
  amount_g: number
  meal_type: MealType
  logged_at: string
  created_at: string
}

export interface WaterLog {
  id: string
  user_id: string
  amount_ml: number
  logged_at: string
}

export interface MealLogWithFood extends MealLog {
  food_item: FoodItem
}

// A candidate result from any food search source (Open Food Facts, the local
// generic-foods list, later AI photo estimates) — not yet a saved food_items row.
// portionG/portionUnit are presentation-only hints for the amount picker (e.g. "1
// portion" or "1 st") — they're never persisted, since meal_logs always stores grams.
export interface FoodSearchResult {
  source: FoodSource
  externalId: string
  name: string
  brand: string | null
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  imageUrl: string | null
  portionG?: number | null
  portionUnit?: 'portion' | 'st'
}
