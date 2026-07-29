import { supabase } from './supabase'

interface PerGramValues {
  calories: number
  protein: number
  carbs: number
  fat: number
}

// Remembers what a user actually logged for an AI-estimated dish (after any
// edits they made in the review form), keyed by normalized name. The
// analyze-meal-text/analyze-meal-photo edge functions read this back to
// ground future estimates of the same dish instead of re-guessing.
export async function upsertFoodCorrection(userId: string, name: string, perGram: PerGramValues): Promise<void> {
  const foodName = name.trim().toLowerCase().slice(0, 200)
  if (!foodName) return

  await supabase.from('food_corrections').upsert(
    {
      user_id: userId,
      food_name: foodName,
      calories_per_100g: Math.round(perGram.calories * 10) / 10,
      protein_per_100g: Math.round(perGram.protein * 10) / 10,
      carbs_per_100g: Math.round(perGram.carbs * 10) / 10,
      fat_per_100g: Math.round(perGram.fat * 10) / 10,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,food_name' },
  )
}
