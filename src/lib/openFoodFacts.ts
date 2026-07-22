import { supabase } from './supabase'
import type { FoodSearchResult } from '../types/domain'

// The .se subdomain scopes results to products sold in Sweden and returns
// Swedish product names/language where available, instead of the global catalog.
const BASE_URL = 'https://se.openfoodfacts.org'
const FIELDS =
  'code,product_name,brands,nutriments,image_front_small_url,image_small_url,' +
  'serving_quantity,serving_quantity_unit,product_quantity,product_quantity_unit'

interface OffRawNutriments {
  'energy-kcal_100g'?: number
  energy_100g?: number
  proteins_100g?: number
  carbohydrates_100g?: number
  fat_100g?: number
}

interface OffRawProduct {
  code?: string
  product_name?: string
  // string from the legacy cgi/search.pl API (comma-separated), string[] from
  // the search-a-licious fuzzy fallback.
  brands?: string | string[]
  nutriments?: OffRawNutriments
  image_front_small_url?: string
  image_small_url?: string
  serving_quantity?: number
  serving_quantity_unit?: string
  product_quantity?: number
  product_quantity_unit?: string
}

const KJ_PER_KCAL = 4.184

function resolveCalories(nutriments: OffRawNutriments): number | undefined {
  if (typeof nutriments['energy-kcal_100g'] === 'number') return nutriments['energy-kcal_100g']
  if (typeof nutriments.energy_100g === 'number') return nutriments.energy_100g / KJ_PER_KCAL
  return undefined
}

// Nutriments are keyed "_100g" even for liquids (OFF treats 1ml ≈ 1g), so we
// only need to normalize the unit prefix, not convert between mass and volume.
function normalizeToGrams(value: number, unit: string | undefined): number | undefined {
  switch (unit?.toLowerCase()) {
    case undefined:
    case 'g':
    case 'ml':
      return value
    case 'kg':
    case 'l':
      return value * 1000
    case 'dl':
      return value * 100
    case 'cl':
      return value * 10
    case 'mg':
      return value / 1000
    default:
      return undefined
  }
}

// Prefer the manufacturer's serving size (one eating instance) over the whole
// package size, but fall back to the package when no serving size is given —
// common for single-serve products (a yogurt cup, a soda can).
function resolvePortionG(raw: OffRawProduct): number | undefined {
  if (typeof raw.serving_quantity === 'number' && raw.serving_quantity > 0) {
    return normalizeToGrams(raw.serving_quantity, raw.serving_quantity_unit)
  }
  if (typeof raw.product_quantity === 'number' && raw.product_quantity > 0) {
    return normalizeToGrams(raw.product_quantity, raw.product_quantity_unit)
  }
  return undefined
}

function mapProduct(raw: OffRawProduct): FoodSearchResult | null {
  const nutriments = raw.nutriments ?? {}
  const name = raw.product_name?.trim()
  const calories = resolveCalories(nutriments)
  const protein = nutriments.proteins_100g
  const carbs = nutriments.carbohydrates_100g
  const fat = nutriments.fat_100g

  if (!raw.code || !name || calories === undefined || protein === undefined || carbs === undefined || fat === undefined) {
    return null
  }

  const portionG = resolvePortionG(raw)
  const brand = Array.isArray(raw.brands) ? raw.brands[0]?.trim() : raw.brands?.split(',')[0]?.trim()

  return {
    source: 'open_food_facts',
    externalId: raw.code,
    name,
    brand: brand || null,
    caloriesPer100g: calories,
    proteinPer100g: protein,
    carbsPer100g: carbs,
    fatPer100g: fat,
    imageUrl: raw.image_front_small_url || raw.image_small_url || null,
    portionG,
    portionUnit: portionG ? 'portion' : undefined,
  }
}

// search-a-licious (Elasticsearch-backed, fuzzy Lucene syntax) doesn't send
// Access-Control-Allow-Origin, so a direct browser fetch() is CORS-blocked
// and rejects outright — routed through an Edge Function instead, which also
// builds the fuzzy query server-side (see supabase/functions/off-fuzzy-search).
async function searchFoodItemsFuzzy(query: string): Promise<FoodSearchResult[]> {
  const { data, error } = await supabase.functions.invoke<{ hits?: OffRawProduct[] }>('off-fuzzy-search', {
    body: { query },
  })
  if (error || !data) return []
  return (data.hits ?? []).map(mapProduct).filter((p): p is FoodSearchResult => p !== null)
}

async function searchFoodItemsLegacy(query: string): Promise<FoodSearchResult[]> {
  const url = new URL(`${BASE_URL}/cgi/search.pl`)
  url.searchParams.set('search_terms', query)
  url.searchParams.set('search_simple', '1')
  url.searchParams.set('action', 'process')
  url.searchParams.set('json', '1')
  url.searchParams.set('page_size', '20')
  url.searchParams.set('lc', 'sv')
  url.searchParams.set('fields', FIELDS)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Sökningen misslyckades')
  const data = (await res.json()) as { products?: OffRawProduct[] }
  return (data.products ?? []).map(mapProduct).filter((p): p is FoodSearchResult => p !== null)
}

// The legacy endpoint occasionally 503s outright (observed 2026-07-22, not
// just typo-related emptiness) and never fuzzy-matches misspellings. Rather
// than awaiting it before trying the fuzzy fallback — which makes every
// search pay the legacy timeout whenever it's down — both run concurrently
// and their results are merged, so a 503 or slow response on one side never
// blocks or delays the other.
export async function searchFoodItems(query: string): Promise<FoodSearchResult[]> {
  const [legacyOutcome, fuzzyOutcome] = await Promise.allSettled([
    searchFoodItemsLegacy(query),
    searchFoodItemsFuzzy(query),
  ])
  const legacy = legacyOutcome.status === 'fulfilled' ? legacyOutcome.value : []
  const fuzzy = fuzzyOutcome.status === 'fulfilled' ? fuzzyOutcome.value : []

  const seen = new Set(legacy.map((r) => r.externalId))
  return [...legacy, ...fuzzy.filter((r) => !seen.has(r.externalId))]
}

export async function lookupBarcode(barcode: string): Promise<FoodSearchResult | null> {
  const url = `${BASE_URL}/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${FIELDS}&lc=sv`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Uppslagning misslyckades')
  const data = (await res.json()) as { status?: number; product?: OffRawProduct }
  if (data.status !== 1 || !data.product) return null
  return mapProduct(data.product)
}
