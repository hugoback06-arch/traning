// Shared lookup of a user's previously corrected AI food estimates — used by
// both analyze-meal-text and analyze-meal-photo to ground a new estimate in
// what the user has actually confirmed/corrected before, instead of
// re-guessing the same dish from scratch every time.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

const MAX_CORRECTIONS = 50

interface FoodCorrectionRow {
  food_name: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
}

export async function buildFoodCorrectionsPromptSection(supabase: SupabaseClient, userId: string): Promise<string> {
  const { data } = await supabase
    .from('food_corrections')
    .select('food_name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(MAX_CORRECTIONS)

  if (!data || data.length === 0) return ''

  const lines = (data as FoodCorrectionRow[]).map(
    (row) =>
      `- ${row.food_name}: ${row.calories_per_100g} kcal, ${row.protein_per_100g} g protein, ${row.carbs_per_100g} g kolhydrater, ${row.fat_per_100g} g fett (per 100 g)`,
  )

  return (
    '\n\nAnvändaren har tidigare loggat och rättat följande rätter till specifika näringsvärden per 100 g. ' +
    'Om den aktuella måltiden med hög sannolikhet är samma rätt (samma namn/typ av rätt), använd EXAKT dessa per-100g-värden istället för att gissa — skala dem bara efter den synliga/beskrivna mängden. ' +
    'Om det bara liknar eller är osäkert vilken av dem det är, ignorera listan och uppskatta som vanligt:\n' +
    lines.join('\n')
  )
}
