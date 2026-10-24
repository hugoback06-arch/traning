import Fuse from 'fuse.js'
import type { FoodSearchResult } from '../types/domain'
import { GENERIC_FOODS, type GenericFood } from '../data/genericFoods'

function toSearchResult(food: GenericFood): FoodSearchResult {
  return {
    source: 'generic',
    externalId: food.slug,
    name: food.name,
    brand: food.brand ?? null,
    caloriesPer100g: food.caloriesPer100g,
    proteinPer100g: food.proteinPer100g,
    carbsPer100g: food.carbsPer100g,
    fatPer100g: food.fatPer100g,
    imageUrl: null,
    portionG: food.portionG,
    portionUnit: food.portionUnit ?? (food.portionG ? 'portion' : undefined),
  }
}

// Strips diacritics (å/ä/ö -> a/a/o, etc.) so a query typed without them
// (e.g. on a non-Swedish keyboard, or just "agg" instead of "ägg") still
// matches — Fuse's fuzzy scoring doesn't treat accented/unaccented letters
// as equivalent on its own.
function stripDiacritics(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

interface SearchableFood extends GenericFood {
  searchText: string
}

const SEARCHABLE_FOODS: SearchableFood[] = GENERIC_FOODS.map((food) => ({
  ...food,
  searchText: stripDiacritics([food.name, food.brand ?? '', ...(food.aliases ?? [])].join(' ')).toLowerCase(),
}))

// threshold 0.35 tolerates a typo or two (t.ex. "koettbullar" -> "Köttbullar")
// without matching on completely unrelated words.
const fuse = new Fuse(SEARCHABLE_FOODS, {
  keys: ['searchText'],
  threshold: 0.35,
  ignoreLocation: true,
})

export function searchGenericFoods(query: string): FoodSearchResult[] {
  const normalized = stripDiacritics(query.trim()).toLowerCase()
  if (normalized.length < 2) return []

  return fuse.search(normalized).map((result) => toSearchResult(result.item))
}
