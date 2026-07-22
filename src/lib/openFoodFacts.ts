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

// search-a-licious (Elasticsearch-backed) supports Lucene fuzzy syntax
// (word~N, edit distance N) — the legacy cgi/search.pl endpoint below does
// near-literal token matching and returns nothing for misspellings.
const FUZZY_SEARCH_URL = 'https://search.openfoodfacts.org/search'

function sanitizeLuceneWord(word: string): string {
  return word.replace(/[^\p{L}\p{N}]/gu, '')
}

// Edit distance 1-2 catches typical typos without matching unrelated short
// words (ES fuzzy on 1-2 char terms is mostly noise).
function fuzzinessForWord(word: string): 0 | 1 | 2 {
  if (word.length <= 2) return 0
  if (word.length <= 5) return 1
  return 2
}

function buildFuzzyQuery(query: string): string | null {
  const words = query
    .trim()
    .split(/\s+/)
    .map(sanitizeLuceneWord)
    .filter((word) => word.length > 0)
  if (words.length === 0) return null

  const wordClauses = words.map((word) => {
    const fuzziness = fuzzinessForWord(word)
    const suffix = fuzziness > 0 ? `~${fuzziness}` : ''
    return `(product_name.sv:${word}${suffix} OR generic_name.sv:${word}${suffix})`
  })

  // Scoped to Sweden to match se.openfoodfacts.org above, and sorted by scan
  // popularity since this endpoint's default relevance ranking is noisy for
  // fuzzy matches (brand-name coincidences outrank the actual product).
  return `countries_tags:"en:sweden" AND ${wordClauses.join(' AND ')}`
}

async function searchFoodItemsFuzzy(query: string): Promise<FoodSearchResult[]> {
  const q = buildFuzzyQuery(query)
  if (!q) return []

  const url = new URL(FUZZY_SEARCH_URL)
  url.searchParams.set('q', q)
  url.searchParams.set('langs', 'sv')
  url.searchParams.set('page_size', '20')
  url.searchParams.set('sort_by', 'unique_scans_n')
  url.searchParams.set('fields', FIELDS)

  const res = await fetch(url.toString())
  if (!res.ok) return []
  const data = (await res.json()) as { hits?: OffRawProduct[] }
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
// just typo-related emptiness) on top of never fuzzy-matching misspellings,
// so both failure modes fall through to the same fuzzy search-a-licious path.
export async function searchFoodItems(query: string): Promise<FoodSearchResult[]> {
  try {
    const results = await searchFoodItemsLegacy(query)
    if (results.length > 0) return results
  } catch {
    // fall through to fuzzy search below
  }
  return searchFoodItemsFuzzy(query)
}

export async function lookupBarcode(barcode: string): Promise<FoodSearchResult | null> {
  const url = `${BASE_URL}/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${FIELDS}&lc=sv`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Uppslagning misslyckades')
  const data = (await res.json()) as { status?: number; product?: OffRawProduct }
  if (data.status !== 1 || !data.product) return null
  return mapProduct(data.product)
}
