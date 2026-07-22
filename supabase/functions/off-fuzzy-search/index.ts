// Supabase Edge Function (Deno). Proxies typo-tolerant food search to Open
// Food Facts' search-a-licious API (search.openfoodfacts.org) server-side.
// That endpoint doesn't send an Access-Control-Allow-Origin header, so a
// direct browser fetch() is silently blocked by CORS and rejects — this
// function exists purely to sidestep that (see src/lib/openFoodFacts.ts).
const FUZZY_SEARCH_URL = 'https://search.openfoodfacts.org/search'
const FIELDS =
  'code,product_name,brands,nutriments,image_front_small_url,image_small_url,' +
  'serving_quantity,serving_quantity_unit,product_quantity,product_quantity_unit'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

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

  // Scoped to Sweden to match se.openfoodfacts.org (the primary search), and
  // sorted by scan popularity since this endpoint's default relevance ranking
  // is noisy for fuzzy matches (brand-name coincidences outrank the product).
  return `countries_tags:"en:sweden" AND ${wordClauses.join(' AND ')}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  let query: unknown
  try {
    ;({ query } = await req.json())
  } catch {
    return jsonResponse({ error: 'Ogiltig begäran', code: 'INVALID_REQUEST' }, 400)
  }

  if (typeof query !== 'string' || !query.trim()) {
    return jsonResponse({ hits: [] })
  }

  const q = buildFuzzyQuery(query)
  if (!q) return jsonResponse({ hits: [] })

  const url = new URL(FUZZY_SEARCH_URL)
  url.searchParams.set('q', q)
  url.searchParams.set('langs', 'sv')
  url.searchParams.set('page_size', '20')
  url.searchParams.set('sort_by', 'unique_scans_n')
  url.searchParams.set('fields', FIELDS)

  try {
    const res = await fetch(url.toString())
    if (!res.ok) return jsonResponse({ hits: [] })
    const data = (await res.json()) as { hits?: unknown[] }
    return jsonResponse({ hits: data.hits ?? [] })
  } catch {
    return jsonResponse({ hits: [] })
  }
})
