import { supabase } from './supabase'
import type { FoodItem, FoodSearchResult } from '../types/domain'

const UNIQUE_VIOLATION = '23505'

/**
 * food_items has no RLS update policy (rows are an immutable shared cache), so we
 * look up an existing row instead of upserting. If two requests race to insert the
 * same barcode, the unique constraint rejects the loser — refetch the winner's row.
 *
 * Generic-food results (source 'generic') are expected to already exist, pre-seeded
 * via supabase/migrations/0002_generic_foods.sql — a client-side insert would need
 * created_by = auth.uid(), misattributing a shared staple food to whoever searched
 * it first, so we fail loudly instead if the seed is missing.
 */
export async function findOrCreateFoodItem(result: FoodSearchResult, userId: string): Promise<FoodItem> {
  const { data: existing, error: selectError } = await supabase
    .from('food_items')
    .select('*')
    .eq('source', result.source)
    .eq('external_id', result.externalId)
    .maybeSingle()

  if (selectError) throw selectError
  if (existing) return existing

  if (result.source === 'generic') {
    throw new Error(`Livsmedlet "${result.name}" saknas i databasen — kör seed-migrationen.`)
  }

  const { data: created, error: insertError } = await supabase
    .from('food_items')
    .insert({
      source: result.source,
      external_id: result.externalId,
      name: result.name,
      brand: result.brand,
      calories_per_100g: result.caloriesPer100g,
      protein_per_100g: result.proteinPer100g,
      carbs_per_100g: result.carbsPer100g,
      fat_per_100g: result.fatPer100g,
      image_url: result.imageUrl,
      created_by: userId,
    })
    .select()
    .single()

  if (!insertError) return created

  if (insertError.code === UNIQUE_VIOLATION) {
    const { data: winner, error: refetchError } = await supabase
      .from('food_items')
      .select('*')
      .eq('source', result.source)
      .eq('external_id', result.externalId)
      .single()
    if (refetchError) throw refetchError
    return winner
  }

  throw insertError
}
