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

function normalize(text: string): string {
  return stripDiacritics(text).toLowerCase()
}

interface SearchableFood extends GenericFood {
  searchText: string
  normalizedName: string
  words: string[]
}

const SEARCHABLE_FOODS: SearchableFood[] = GENERIC_FOODS.map((food) => {
  const searchText = normalize([food.name, food.brand ?? '', ...(food.aliases ?? [])].join(' '))
  return {
    ...food,
    searchText,
    normalizedName: normalize(food.name),
    words: searchText.split(/[^a-z0-9]+/).filter(Boolean),
  }
})

const MAX_RESULTS = 30

// threshold 0.35 tolerates a typo or two (t.ex. "koettbullar" -> "Köttbullar")
// without matching on completely unrelated words.
const fuse = new Fuse(SEARCHABLE_FOODS, {
  keys: ['searchText'],
  threshold: 0.35,
  ignoreLocation: true,
  includeScore: true,
})

// Fuse's fuzzy score alone ranks "Filmjölk" above "Mjölk" and plain nuggets
// above "mcd nuggets", so exact/prefix/all-words hits are tiered first and
// Fuse's score only orders results within a tier. Lower tier = better.
function matchTier(food: SearchableFood, normalized: string, tokens: string[]): number {
  if (food.normalizedName === normalized) return 0
  if (food.normalizedName.startsWith(`${normalized} `) || food.normalizedName.startsWith(`${normalized},`)) return 1
  if (food.normalizedName.startsWith(normalized)) return 2
  if (tokens.every((token) => food.words.some((word) => word.includes(token)))) return 3
  return 4
}

export function searchGenericFoods(query: string): FoodSearchResult[] {
  const normalized = normalize(query.trim())
  if (normalized.length < 2) return []
  const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean)

  return fuse
    .search(normalized)
    .map((result) => ({ food: result.item, tier: matchTier(result.item, normalized, tokens), score: result.score ?? 1 }))
    .sort((a, b) => a.tier - b.tier || a.score - b.score)
    .slice(0, MAX_RESULTS)
    .map(({ food }) => toSearchResult(food))
}
