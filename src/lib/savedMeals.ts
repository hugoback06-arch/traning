import { supabase } from './supabase'
import type { SavedMeal, SavedMealItemWithFood, SavedMealWithItems } from '../types/domain'

export async function fetchSavedMealsWithItems(userId: string): Promise<SavedMealWithItems[]> {
  const { data: meals, error: mealsError } = await supabase
    .from('saved_meals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (mealsError) throw mealsError
  if (!meals || meals.length === 0) return []

  const { data: items, error: itemsError } = await supabase
    .from('saved_meal_items')
    .select('*, food_item:food_items(*)')
    .in(
      'saved_meal_id',
      meals.map((meal) => meal.id),
    )
    .order('sort_order', { ascending: true })
  if (itemsError) throw itemsError

  const itemsByMeal = new Map<string, SavedMealItemWithFood[]>()
  for (const item of (items as unknown as SavedMealItemWithFood[]) ?? []) {
    const list = itemsByMeal.get(item.saved_meal_id)
    if (list) list.push(item)
    else itemsByMeal.set(item.saved_meal_id, [item])
  }

  return meals.map((meal) => ({ ...meal, items: itemsByMeal.get(meal.id) ?? [] }))
}

export async function createSavedMeal(
  userId: string,
  name: string,
  items: { foodItemId: string; amountG: number }[],
): Promise<SavedMeal> {
  const { data: meal, error: mealError } = await supabase
    .from('saved_meals')
    .insert({ user_id: userId, name })
    .select()
    .single()
  if (mealError) throw mealError

  const { error: itemsError } = await supabase.from('saved_meal_items').insert(
    items.map((item, index) => ({
      saved_meal_id: meal.id,
      food_item_id: item.foodItemId,
      amount_g: item.amountG,
      sort_order: index,
    })),
  )
  if (itemsError) throw itemsError

  return meal
}

export async function deleteSavedMeal(id: string): Promise<void> {
  const { error } = await supabase.from('saved_meals').delete().eq('id', id)
  if (error) throw error
}

export async function renameSavedMeal(id: string, name: string): Promise<void> {
  const { error } = await supabase.from('saved_meals').update({ name }).eq('id', id)
  if (error) throw error
}

export function sumSavedMealKcal(items: SavedMealItemWithFood[]): number {
  return items.reduce((sum, item) => sum + (item.food_item.calories_per_100g * item.amount_g) / 100, 0)
}
