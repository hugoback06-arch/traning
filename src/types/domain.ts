export type Sex = 'male' | 'female' | 'other'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type WeightGoal = 'lose' | 'maintain' | 'gain'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type FoodSource = 'open_food_facts' | 'ai_estimate' | 'generic'
export type ThemePreference = 'system' | 'light' | 'dark'

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
  theme_preference: ThemePreference
  notifications_enabled: boolean
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

// --- Träningsdel ---

export type WorkoutSource = 'manual' | 'strava' | 'garmin' | 'ai_plan'
export type ActivityType = 'running' | 'cycling' | 'swimming' | 'strength' | 'walking' | 'other'
export type PlanActivityType = ActivityType | 'rest'
export type TrainingPlanStatus = 'active' | 'completed' | 'archived'
export type IntensityPreference = 'lower' | 'as_planned' | 'higher'
export type FitnessProvider = 'strava' | 'garmin'

export interface FitnessConnection {
  id: string
  user_id: string
  provider: FitnessProvider
  external_athlete_id: string | null
  access_token: string
  refresh_token: string | null
  expires_at: string | null
  scope: string | null
  connected_at: string
  last_synced_at: string | null
}

export interface Exercise {
  id: string
  name: string
  muscle_group: string | null
  equipment: string | null
  is_custom: boolean
  created_by: string | null
  created_at: string
}

export interface Workout {
  id: string
  user_id: string
  source: WorkoutSource
  external_id: string | null
  activity_type: ActivityType
  title: string | null
  started_at: string
  duration_seconds: number | null
  distance_meters: number | null
  calories_burned: number | null
  avg_heart_rate: number | null
  max_heart_rate: number | null
  elevation_gain_meters: number | null
  perceived_exertion: number | null
  training_plan_session_id: string | null
  raw_data: unknown
  created_at: string
  updated_at: string
}

export interface WorkoutSet {
  id: string
  workout_id: string
  exercise_id: string
  set_number: number
  reps: number | null
  weight_kg: number | null
  rpe: number | null
  rest_seconds: number | null
  created_at: string
}

export interface WorkoutSetWithExercise extends WorkoutSet {
  exercise: Exercise
}

export interface TrainingPlan {
  id: string
  user_id: string
  name: string
  goal: string | null
  source_prompt: string | null
  start_date: string
  end_date: string | null
  status: TrainingPlanStatus
  intensity_preference: IntensityPreference
  created_at: string
}

export interface TrainingPlanAdjustment {
  id: string
  training_plan_id: string
  user_id: string
  note: string
  created_at: string
}

export interface TrainingPlanSession {
  id: string
  training_plan_id: string
  scheduled_date: string
  activity_type: PlanActivityType
  title: string
  description: string | null
  target_data: Record<string, unknown> | null
  completed_workout_id: string | null
  created_at: string
}

export interface WorkoutEvaluation {
  id: string
  workout_id: string
  user_id: string
  summary: string
  feedback: string | null
  score: number | null
  created_at: string
}

export interface CalorieAdjustment {
  id: string
  user_id: string
  workout_id: string | null
  adjustment_date: string
  extra_kcal: number
  reason: string | null
  created_at: string
}

export interface WorkoutDetail extends Workout {
  sets: WorkoutSetWithExercise[]
  evaluation: WorkoutEvaluation | null
  calorieAdjustment: CalorieAdjustment | null
  session: TrainingPlanSession | null
}
