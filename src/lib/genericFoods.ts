import Fuse from 'fuse.js'
import type { FoodSearchResult } from '../types/domain'

interface GenericFood {
  slug: string
  name: string
  aliases?: string[]
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  /** Typical single-portion/unit weight in grams, if this food is usually eaten as one. */
  portionG?: number
  /** 'st' for countable units (1 ägg, 1 banan), 'portion' for a plated dish. Defaults to 'portion'. */
  portionUnit?: 'portion' | 'st'
}

// Curated Swedish staples + common home-cooked dishes, for when Open Food
// Facts' barcode-centric database doesn't have a plain "banan" or "köttbullar".
// Kept in sync by hand with supabase/migrations/0003_seed_generic_foods.sql and
// 0004_more_generic_foods.sql (portionG/portionUnit are UI-only and not persisted).
const GENERIC_FOODS: GenericFood[] = [
  // Raw ingredients / staples
  { slug: 'banan', name: 'Banan', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 22.8, fatPer100g: 0.3, portionG: 120, portionUnit: 'st' },
  { slug: 'apple', name: 'Äpple', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 13.8, fatPer100g: 0.2, portionG: 150, portionUnit: 'st' },
  { slug: 'apelsin', name: 'Apelsin', caloriesPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 11.8, fatPer100g: 0.1 },
  { slug: 'jordgubbar', name: 'Jordgubbar', caloriesPer100g: 32, proteinPer100g: 0.7, carbsPer100g: 7.7, fatPer100g: 0.3 },
  { slug: 'avokado', name: 'Avokado', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 8.5, fatPer100g: 14.7 },
  { slug: 'mjolk-standard', name: 'Mjölk, standardmjölk 3%', aliases: ['mjölk'], caloriesPer100g: 61, proteinPer100g: 3.4, carbsPer100g: 4.7, fatPer100g: 3.3 },
  { slug: 'mjolk-lattmjolk', name: 'Lättmjölk 0.5%', aliases: ['mjölk'], caloriesPer100g: 35, proteinPer100g: 3.4, carbsPer100g: 4.9, fatPer100g: 0.5 },
  { slug: 'filmjolk', name: 'Filmjölk', caloriesPer100g: 62, proteinPer100g: 3.5, carbsPer100g: 4.7, fatPer100g: 3 },
  { slug: 'yoghurt-naturell', name: 'Yoghurt, naturell', aliases: ['yoghurt'], caloriesPer100g: 61, proteinPer100g: 3.5, carbsPer100g: 4.7, fatPer100g: 3.3 },
  { slug: 'keso', name: 'Keso', caloriesPer100g: 98, proteinPer100g: 12, carbsPer100g: 3.4, fatPer100g: 4.3 },
  { slug: 'ost-hushall', name: 'Hushållsost', aliases: ['ost'], caloriesPer100g: 350, proteinPer100g: 25, carbsPer100g: 2, fatPer100g: 27 },
  { slug: 'smor', name: 'Smör', caloriesPer100g: 717, proteinPer100g: 0.9, carbsPer100g: 0.1, fatPer100g: 81 },
  { slug: 'agg', name: 'Ägg', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, portionG: 60, portionUnit: 'st' },
  { slug: 'kycklingbrost', name: 'Kycklingbröst, tillagat', aliases: ['kyckling'], caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
  { slug: 'notfars', name: 'Nötfärs 10%, tillagad', aliases: ['nötfärs', 'köttfärs'], caloriesPer100g: 217, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 12 },
  { slug: 'flaskfile', name: 'Fläskfilé, tillagad', aliases: ['fläsk'], caloriesPer100g: 143, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 3.5 },
  { slug: 'lax', name: 'Lax, tillagad', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13 },
  { slug: 'rakor', name: 'Räkor', caloriesPer100g: 99, proteinPer100g: 24, carbsPer100g: 0.2, fatPer100g: 0.3 },
  { slug: 'tofu', name: 'Tofu', caloriesPer100g: 76, proteinPer100g: 8, carbsPer100g: 1.9, fatPer100g: 4.8 },
  { slug: 'ris-kokt', name: 'Ris, kokt', aliases: ['ris'], caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3 },
  { slug: 'pasta-kokt', name: 'Pasta, kokt', aliases: ['pasta'], caloriesPer100g: 131, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 1.1 },
  { slug: 'potatis-kokt', name: 'Potatis, kokt', aliases: ['potatis'], caloriesPer100g: 87, proteinPer100g: 1.9, carbsPer100g: 20, fatPer100g: 0.1 },
  { slug: 'havregryn', name: 'Havregryn', caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66, fatPer100g: 6.9 },
  { slug: 'brod-vitt', name: 'Bröd, vitt', aliases: ['bröd'], caloriesPer100g: 265, proteinPer100g: 9, carbsPer100g: 49, fatPer100g: 3.2 },
  { slug: 'brod-fullkorn', name: 'Bröd, fullkorn', aliases: ['bröd'], caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 4.2 },
  { slug: 'linser-kokta', name: 'Linser, kokta', aliases: ['linser'], caloriesPer100g: 116, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 0.4 },
  { slug: 'kikartor-kokta', name: 'Kikärtor, kokta', aliases: ['kikärtor'], caloriesPer100g: 164, proteinPer100g: 8.9, carbsPer100g: 27, fatPer100g: 2.6 },
  { slug: 'mandel', name: 'Mandel', caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50 },
  { slug: 'jordnotssmor', name: 'Jordnötssmör', aliases: ['jordnötssmör'], caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50 },
  { slug: 'olivolja', name: 'Olivolja', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100 },
  { slug: 'broccoli-kokt', name: 'Broccoli, kokt', aliases: ['broccoli'], caloriesPer100g: 35, proteinPer100g: 2.4, carbsPer100g: 7.2, fatPer100g: 0.4 },
  { slug: 'morot', name: 'Morot', caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 9.6, fatPer100g: 0.2 },
  { slug: 'tomat', name: 'Tomat', caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2 },
  { slug: 'gurka', name: 'Gurka', caloriesPer100g: 15, proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1 },

  // Färdiga svenska rätter — kcal/makron är ett genomsnitt för hela rätten, kan
  // såklart variera med recept. portionG är en typisk tallriksportion.
  { slug: 'kottbullar', name: 'Köttbullar', aliases: ['köttbulle'], caloriesPer100g: 220, proteinPer100g: 13, carbsPer100g: 8, fatPer100g: 15, portionG: 150 },
  { slug: 'pannkakor', name: 'Pannkakor', caloriesPer100g: 227, proteinPer100g: 6, carbsPer100g: 28, fatPer100g: 9, portionG: 200 },
  { slug: 'pizza', name: 'Pizza', caloriesPer100g: 266, proteinPer100g: 11, carbsPer100g: 33, fatPer100g: 10, portionG: 300 },
  { slug: 'falukorv', name: 'Falukorv', aliases: ['korv'], caloriesPer100g: 220, proteinPer100g: 12, carbsPer100g: 3, fatPer100g: 18, portionG: 150 },
  { slug: 'pyttipanna', name: 'Pyttipanna med ägg', aliases: ['pytt i panna'], caloriesPer100g: 180, proteinPer100g: 6, carbsPer100g: 15, fatPer100g: 10, portionG: 400 },
  { slug: 'artsoppa', name: 'Ärtsoppa med fläsk', aliases: ['ärtsoppa'], caloriesPer100g: 75, proteinPer100g: 5, carbsPer100g: 8, fatPer100g: 2.5, portionG: 300 },
  { slug: 'kalops', name: 'Kalops med potatis', caloriesPer100g: 140, proteinPer100g: 9, carbsPer100g: 12, fatPer100g: 6, portionG: 400 },
  { slug: 'janssons', name: 'Janssons frestelse', aliases: ['janssons frestelse'], caloriesPer100g: 180, proteinPer100g: 4, carbsPer100g: 14, fatPer100g: 12, portionG: 250 },
  { slug: 'raggmunk', name: 'Raggmunk med fläsk', caloriesPer100g: 230, proteinPer100g: 7, carbsPer100g: 20, fatPer100g: 14, portionG: 300 },
  { slug: 'lasagne', name: 'Lasagne', caloriesPer100g: 150, proteinPer100g: 8, carbsPer100g: 13, fatPer100g: 8, portionG: 350 },
  { slug: 'tacos', name: 'Tacos', caloriesPer100g: 180, proteinPer100g: 8, carbsPer100g: 16, fatPer100g: 9, portionG: 350 },
  { slug: 'korv-stroganoff', name: 'Korv stroganoff med ris', aliases: ['korvstroganoff'], caloriesPer100g: 165, proteinPer100g: 6, carbsPer100g: 18, fatPer100g: 8, portionG: 400 },
  { slug: 'fiskgratang', name: 'Fiskgratäng', caloriesPer100g: 150, proteinPer100g: 12, carbsPer100g: 6, fatPer100g: 9, portionG: 350 },
  { slug: 'kycklinggryta', name: 'Kycklinggryta med ris', caloriesPer100g: 140, proteinPer100g: 10, carbsPer100g: 15, fatPer100g: 5, portionG: 400 },
  { slug: 'wienerschnitzel', name: 'Wienerschnitzel med potatis', caloriesPer100g: 200, proteinPer100g: 12, carbsPer100g: 15, fatPer100g: 11, portionG: 350 },
  { slug: 'biff-lok', name: 'Biff med lök och potatismos', aliases: ['biff med lök'], caloriesPer100g: 190, proteinPer100g: 13, carbsPer100g: 10, fatPer100g: 11, portionG: 350 },
  { slug: 'kebabtallrik', name: 'Kebabtallrik', caloriesPer100g: 170, proteinPer100g: 9, carbsPer100g: 15, fatPer100g: 9, portionG: 400 },
  { slug: 'sushi', name: 'Sushi, blandad', caloriesPer100g: 150, proteinPer100g: 6, carbsPer100g: 25, fatPer100g: 3, portionG: 300 },
  { slug: 'korv-brod', name: 'Korv med bröd', aliases: ['varm korv', 'grillad korv'], caloriesPer100g: 230, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 13, portionG: 150 },
  { slug: 'kladdkaka', name: 'Kladdkaka', caloriesPer100g: 400, proteinPer100g: 5, carbsPer100g: 45, fatPer100g: 22, portionG: 80 },
  { slug: 'flaskpannkaka', name: 'Fläskpannkaka', caloriesPer100g: 230, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 13, portionG: 300 },
  { slug: 'kramig-kycklingpasta', name: 'Krämig kycklingpasta', aliases: ['kycklingpasta'], caloriesPer100g: 180, proteinPer100g: 9, carbsPer100g: 16, fatPer100g: 9, portionG: 400 },
]

function toSearchResult(food: GenericFood): FoodSearchResult {
  return {
    source: 'generic',
    externalId: food.slug,
    name: food.name,
    brand: null,
    caloriesPer100g: food.caloriesPer100g,
    proteinPer100g: food.proteinPer100g,
    carbsPer100g: food.carbsPer100g,
    fatPer100g: food.fatPer100g,
    imageUrl: null,
    portionG: food.portionG,
    portionUnit: food.portionUnit ?? (food.portionG ? 'portion' : undefined),
  }
}

// threshold 0.35 tolerates a typo or two (t.ex. "koettbullar" -> "Köttbullar")
// without matching on completely unrelated words.
const fuse = new Fuse(GENERIC_FOODS, {
  keys: ['name', 'aliases'],
  threshold: 0.35,
  ignoreLocation: true,
})

export function searchGenericFoods(query: string): FoodSearchResult[] {
  const normalized = query.trim()
  if (normalized.length < 2) return []

  return fuse.search(normalized).map((result) => toSearchResult(result.item))
}
