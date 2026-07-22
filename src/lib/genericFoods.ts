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
// Kept in sync by hand with supabase/migrations/0003_seed_generic_foods.sql,
// 0004_more_generic_foods.sql, 0014_more_generic_dishes.sql and
// 0016_even_more_generic_dishes.sql (portionG/portionUnit are UI-only and not persisted).
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

  // Husmanskost
  { slug: 'flaskkotlett-makaroner', name: 'Fläskkotlett med stuvade makaroner', aliases: ['fläskkotlett'], caloriesPer100g: 200, proteinPer100g: 12, carbsPer100g: 12, fatPer100g: 11, portionG: 350 },
  { slug: 'kroppkakor', name: 'Kroppkakor med lingon', caloriesPer100g: 180, proteinPer100g: 7, carbsPer100g: 22, fatPer100g: 7, portionG: 350 },
  { slug: 'kaldolmar', name: 'Kåldolmar med potatis och lingon', aliases: ['kåldolme'], caloriesPer100g: 160, proteinPer100g: 9, carbsPer100g: 14, fatPer100g: 7, portionG: 400 },
  { slug: 'dillkott', name: 'Dillkött med potatis', aliases: ['kalvfrikassé'], caloriesPer100g: 150, proteinPer100g: 12, carbsPer100g: 8, fatPer100g: 8, portionG: 350 },
  { slug: 'kokt-torsk-aggsas', name: 'Kokt torsk med äggsås och potatis', aliases: ['torsk'], caloriesPer100g: 130, proteinPer100g: 14, carbsPer100g: 10, fatPer100g: 3.5, portionG: 400 },
  { slug: 'stekt-stromming', name: 'Stekt strömming med potatismos', aliases: ['strömming'], caloriesPer100g: 200, proteinPer100g: 12, carbsPer100g: 12, fatPer100g: 12, portionG: 350 },
  { slug: 'sill-potatis', name: 'Sill och potatis med gräddfil', aliases: ['inlagd sill'], caloriesPer100g: 170, proteinPer100g: 8, carbsPer100g: 12, fatPer100g: 10, portionG: 300 },
  { slug: 'rotmos-flask', name: 'Rotmos med fläsk', caloriesPer100g: 150, proteinPer100g: 6, carbsPer100g: 12, fatPer100g: 9, portionG: 350 },
  { slug: 'ugnspannkaka', name: 'Ugnspannkaka med fläsk', caloriesPer100g: 210, proteinPer100g: 8, carbsPer100g: 18, fatPer100g: 12, portionG: 300 },
  { slug: 'isterband', name: 'Isterband med rotmos', caloriesPer100g: 230, proteinPer100g: 9, carbsPer100g: 12, fatPer100g: 16, portionG: 350 },
  { slug: 'kalvsylta', name: 'Kalvsylta med rödbetor', caloriesPer100g: 180, proteinPer100g: 14, carbsPer100g: 4, fatPer100g: 12, portionG: 200 },
  { slug: 'blodpudding', name: 'Blodpudding med lingon och bacon', caloriesPer100g: 220, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 12, portionG: 250 },
  { slug: 'rimmad-oxbringa', name: 'Rimmad oxbringa med rotmos', caloriesPer100g: 180, proteinPer100g: 15, carbsPer100g: 8, fatPer100g: 10, portionG: 350 },

  // Pasta
  { slug: 'spaghetti-bolognese', name: 'Spaghetti bolognese', aliases: ['bolognese'], caloriesPer100g: 155, proteinPer100g: 7, carbsPer100g: 17, fatPer100g: 6, portionG: 400 },
  { slug: 'pasta-carbonara', name: 'Pasta carbonara', aliases: ['carbonara'], caloriesPer100g: 200, proteinPer100g: 8, carbsPer100g: 18, fatPer100g: 11, portionG: 350 },
  { slug: 'pasta-pesto', name: 'Pasta med pesto', caloriesPer100g: 180, proteinPer100g: 6, carbsPer100g: 22, fatPer100g: 8, portionG: 350 },
  { slug: 'makaroner-koettfarssas', name: 'Makaroner med köttfärssås', aliases: ['makaroner och köttfärssås'], caloriesPer100g: 150, proteinPer100g: 7, carbsPer100g: 16, fatPer100g: 6, portionG: 400 },

  // Asiatiskt
  { slug: 'kycklingwok', name: 'Kycklingwok med nudlar', caloriesPer100g: 140, proteinPer100g: 9, carbsPer100g: 15, fatPer100g: 5, portionG: 400 },
  { slug: 'pad-thai', name: 'Pad thai', caloriesPer100g: 165, proteinPer100g: 8, carbsPer100g: 20, fatPer100g: 6, portionG: 400 },
  { slug: 'ramen-flask', name: 'Ramen med fläsk', aliases: ['ramen'], caloriesPer100g: 110, proteinPer100g: 6, carbsPer100g: 12, fatPer100g: 4, portionG: 500 },
  { slug: 'dumplings', name: 'Dumplings/gyoza', aliases: ['gyoza'], caloriesPer100g: 200, proteinPer100g: 8, carbsPer100g: 22, fatPer100g: 9, portionG: 200 },
  { slug: 'nasi-goreng', name: 'Nasi goreng', caloriesPer100g: 170, proteinPer100g: 7, carbsPer100g: 22, fatPer100g: 6, portionG: 350 },

  // Indiskt/curry
  { slug: 'tikka-masala', name: 'Kyckling tikka masala med ris', aliases: ['tikka masala'], caloriesPer100g: 150, proteinPer100g: 9, carbsPer100g: 15, fatPer100g: 6, portionG: 400 },
  { slug: 'butter-chicken', name: 'Butter chicken med ris', caloriesPer100g: 170, proteinPer100g: 9, carbsPer100g: 16, fatPer100g: 8, portionG: 400 },
  { slug: 'gronsakscurry', name: 'Grönsakscurry med ris', aliases: ['curry'], caloriesPer100g: 120, proteinPer100g: 3, carbsPer100g: 18, fatPer100g: 4, portionG: 400 },

  // Mexikanskt
  { slug: 'burrito', name: 'Burrito med kött', caloriesPer100g: 190, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 8, portionG: 300 },
  { slug: 'quesadilla', name: 'Quesadilla', caloriesPer100g: 250, proteinPer100g: 10, carbsPer100g: 22, fatPer100g: 14, portionG: 200 },
  { slug: 'nachos', name: 'Nachos med ost', caloriesPer100g: 300, proteinPer100g: 8, carbsPer100g: 30, fatPer100g: 17, portionG: 250 },
  { slug: 'chili-con-carne', name: 'Chili con carne', caloriesPer100g: 130, proteinPer100g: 9, carbsPer100g: 10, fatPer100g: 6, portionG: 350 },

  // Snabbmat
  { slug: 'hamburgare', name: 'Hamburgare med bröd', aliases: ['burgare'], caloriesPer100g: 250, proteinPer100g: 13, carbsPer100g: 20, fatPer100g: 13, portionG: 250 },
  { slug: 'cheeseburgare', name: 'Cheeseburgare med bröd', caloriesPer100g: 270, proteinPer100g: 14, carbsPer100g: 20, fatPer100g: 15, portionG: 250 },
  { slug: 'pommes-frites', name: 'Pommes frites', aliases: ['pommes'], caloriesPer100g: 290, proteinPer100g: 3.4, carbsPer100g: 38, fatPer100g: 14, portionG: 150 },
  { slug: 'falafel-brod', name: 'Falafel med bröd och sås', aliases: ['falafel'], caloriesPer100g: 220, proteinPer100g: 8, carbsPer100g: 24, fatPer100g: 10, portionG: 300 },
  { slug: 'kebabrulle', name: 'Kebabrulle', caloriesPer100g: 230, proteinPer100g: 9, carbsPer100g: 25, fatPer100g: 11, portionG: 300 },

  // Sallader
  { slug: 'cesarsallad-kyckling', name: 'Cesarsallad med kyckling', aliases: ['cesarsallad'], caloriesPer100g: 140, proteinPer100g: 10, carbsPer100g: 5, fatPer100g: 9, portionG: 350 },
  { slug: 'halloumisallad', name: 'Halloumisallad', caloriesPer100g: 180, proteinPer100g: 8, carbsPer100g: 8, fatPer100g: 13, portionG: 350 },
  { slug: 'tonfisksallad', name: 'Tonfisksallad', caloriesPer100g: 110, proteinPer100g: 10, carbsPer100g: 6, fatPer100g: 5, portionG: 350 },

  // Soppor
  { slug: 'broccolisoppa', name: 'Broccolisoppa', caloriesPer100g: 55, proteinPer100g: 3, carbsPer100g: 5, fatPer100g: 2.5, portionG: 350 },
  { slug: 'tomatsoppa', name: 'Tomatsoppa', caloriesPer100g: 45, proteinPer100g: 1.5, carbsPer100g: 7, fatPer100g: 1.5, portionG: 350 },
  { slug: 'linssoppa', name: 'Linssoppa', caloriesPer100g: 80, proteinPer100g: 5, carbsPer100g: 12, fatPer100g: 1.5, portionG: 350 },
  { slug: 'currysoppa-kyckling', name: 'Currysoppa med kyckling', caloriesPer100g: 90, proteinPer100g: 6, carbsPer100g: 8, fatPer100g: 4, portionG: 350 },

  // Frukost
  { slug: 'havregrynsgrot', name: 'Havregrynsgröt med mjölk', aliases: ['gröt', 'havregröt'], caloriesPer100g: 85, proteinPer100g: 3.5, carbsPer100g: 13, fatPer100g: 2, portionG: 300 },
  { slug: 'smorgas-skinka-ost', name: 'Smörgås med skinka och ost', aliases: ['skinksmörgås'], caloriesPer100g: 260, proteinPer100g: 14, carbsPer100g: 28, fatPer100g: 10, portionG: 80 },
  { slug: 'aggrora-bacon', name: 'Äggröra med bacon', caloriesPer100g: 220, proteinPer100g: 15, carbsPer100g: 1, fatPer100g: 17, portionG: 150 },

  // Grill och fisk
  { slug: 'grillad-kyckling-potatissallad', name: 'Grillad kyckling med potatissallad', caloriesPer100g: 180, proteinPer100g: 15, carbsPer100g: 10, fatPer100g: 8, portionG: 400 },
  { slug: 'revbensspjall', name: 'Revbensspjäll med potatissallad', aliases: ['revben'], caloriesPer100g: 260, proteinPer100g: 15, carbsPer100g: 8, fatPer100g: 18, portionG: 400 },
  { slug: 'laxfile-potatis', name: 'Laxfilé med potatis och sås', caloriesPer100g: 180, proteinPer100g: 15, carbsPer100g: 10, fatPer100g: 9, portionG: 400 },
  { slug: 'fish-and-chips', name: 'Fish and chips', caloriesPer100g: 230, proteinPer100g: 10, carbsPer100g: 20, fatPer100g: 12, portionG: 350 },

  // Vegetariskt/veganskt
  { slug: 'vegetarisk-lasagne', name: 'Vegetarisk lasagne', caloriesPer100g: 130, proteinPer100g: 6, carbsPer100g: 14, fatPer100g: 6, portionG: 350 },
  { slug: 'linsbolognese', name: 'Linsbolognese med pasta', caloriesPer100g: 130, proteinPer100g: 6, carbsPer100g: 20, fatPer100g: 3, portionG: 400 },
  { slug: 'veggieburgare', name: 'Veggieburgare med bröd', caloriesPer100g: 200, proteinPer100g: 9, carbsPer100g: 22, fatPer100g: 8, portionG: 250 },
  { slug: 'halloumiwok', name: 'Halloumiwok', caloriesPer100g: 160, proteinPer100g: 9, carbsPer100g: 12, fatPer100g: 9, portionG: 400 },

  // Fika/söt
  { slug: 'kanelbulle', name: 'Kanelbulle', caloriesPer100g: 350, proteinPer100g: 7, carbsPer100g: 45, fatPer100g: 15, portionG: 65, portionUnit: 'st' },
  { slug: 'semla', name: 'Semla', caloriesPer100g: 330, proteinPer100g: 6, carbsPer100g: 33, fatPer100g: 19, portionG: 120, portionUnit: 'st' },
  { slug: 'vaffla-sylt-gradde', name: 'Våffla med sylt och grädde', aliases: ['våfflor'], caloriesPer100g: 290, proteinPer100g: 5, carbsPer100g: 30, fatPer100g: 16, portionG: 150 },

  // Fler svenska klassiker
  { slug: 'wallenbergare', name: 'Wallenbergare med gröna ärtor och potatismos', caloriesPer100g: 240, proteinPer100g: 10, carbsPer100g: 10, fatPer100g: 18, portionG: 350 },
  { slug: 'skagenrora', name: 'Toast Skagen', aliases: ['skagenröra'], caloriesPer100g: 260, proteinPer100g: 8, carbsPer100g: 18, fatPer100g: 17, portionG: 150 },
  { slug: 'biff-rydberg', name: 'Biff Rydberg', caloriesPer100g: 210, proteinPer100g: 12, carbsPer100g: 12, fatPer100g: 13, portionG: 350 },
  { slug: 'kalvfile-oscar', name: 'Kalvfilé Oscar', caloriesPer100g: 200, proteinPer100g: 18, carbsPer100g: 5, fatPer100g: 12, portionG: 300 },
  { slug: 'lutfisk', name: 'Lutfisk med vit sås och ärtor', caloriesPer100g: 110, proteinPer100g: 12, carbsPer100g: 6, fatPer100g: 4, portionG: 400 },
  { slug: 'julskinka', name: 'Julskinka med sås och rödkål', caloriesPer100g: 190, proteinPer100g: 16, carbsPer100g: 8, fatPer100g: 10, portionG: 300 },
  { slug: 'prinskorv-potatismos', name: 'Prinskorv med potatismos', caloriesPer100g: 210, proteinPer100g: 8, carbsPer100g: 14, fatPer100g: 13, portionG: 350 },
  { slug: 'kottfarslimpa', name: 'Köttfärslimpa med sås och potatis', aliases: ['köttfärslimpa'], caloriesPer100g: 170, proteinPer100g: 10, carbsPer100g: 12, fatPer100g: 9, portionG: 400 },
  { slug: 'palt', name: 'Blodpalt med fläsk och lingon', caloriesPer100g: 200, proteinPer100g: 6, carbsPer100g: 30, fatPer100g: 7, portionG: 350 },
  { slug: 'renskav', name: 'Renskav med lingon och potatismos', caloriesPer100g: 170, proteinPer100g: 11, carbsPer100g: 12, fatPer100g: 8, portionG: 350 },
  { slug: 'kalvschnitzel', name: 'Kalvschnitzel med potatis', caloriesPer100g: 200, proteinPer100g: 14, carbsPer100g: 14, fatPer100g: 10, portionG: 350 },

  // Proteinmåltider / gymmat
  { slug: 'kyckling-ris-broccoli', name: 'Kyckling, ris och broccoli', caloriesPer100g: 140, proteinPer100g: 14, carbsPer100g: 15, fatPer100g: 2.5, portionG: 400 },
  { slug: 'proteinbowl-kyckling', name: 'Proteinbowl med kyckling och quinoa', caloriesPer100g: 150, proteinPer100g: 13, carbsPer100g: 14, fatPer100g: 4, portionG: 400 },
  { slug: 'laxbowl-quinoa', name: 'Laxbowl med quinoa och avokado', caloriesPer100g: 170, proteinPer100g: 12, carbsPer100g: 12, fatPer100g: 8, portionG: 400 },
  { slug: 'overnight-oats', name: 'Overnight oats med bär', caloriesPer100g: 110, proteinPer100g: 4, carbsPer100g: 16, fatPer100g: 3, portionG: 300 },
  { slug: 'kvarg-bar-granola', name: 'Kvarg med bär och granola', caloriesPer100g: 100, proteinPer100g: 9, carbsPer100g: 12, fatPer100g: 2, portionG: 300 },
  { slug: 'protein-pannkakor', name: 'Proteinpannkakor', caloriesPer100g: 180, proteinPer100g: 15, carbsPer100g: 15, fatPer100g: 6, portionG: 250 },
  { slug: 'kycklingfile-sotpotatis', name: 'Kycklingfilé med sötpotatis och grönsaker', caloriesPer100g: 130, proteinPer100g: 15, carbsPer100g: 12, fatPer100g: 2.5, portionG: 400 },
  { slug: 'poke-bowl-lax', name: 'Pokebowl med lax', aliases: ['poké bowl'], caloriesPer100g: 150, proteinPer100g: 9, carbsPer100g: 18, fatPer100g: 5, portionG: 400 },
  { slug: 'buddha-bowl', name: 'Buddha bowl med kikärtor', caloriesPer100g: 130, proteinPer100g: 5, carbsPer100g: 15, fatPer100g: 5, portionG: 400 },

  // Italienskt
  { slug: 'risotto-svamp', name: 'Risotto med svamp', caloriesPer100g: 150, proteinPer100g: 4, carbsPer100g: 22, fatPer100g: 5, portionG: 350 },
  { slug: 'gnocchi-gorgonzola', name: 'Gnocchi med gorgonzolasås', caloriesPer100g: 190, proteinPer100g: 6, carbsPer100g: 22, fatPer100g: 9, portionG: 350 },
  { slug: 'calzone', name: 'Pizza calzone', caloriesPer100g: 260, proteinPer100g: 11, carbsPer100g: 30, fatPer100g: 10, portionG: 350 },
  { slug: 'tortellini-gradde', name: 'Tortellini med gräddsås', caloriesPer100g: 200, proteinPer100g: 8, carbsPer100g: 20, fatPer100g: 10, portionG: 350 },
  { slug: 'minestrone', name: 'Minestronesoppa', caloriesPer100g: 55, proteinPer100g: 2.5, carbsPer100g: 8, fatPer100g: 1.5, portionG: 350 },
  { slug: 'bruschetta', name: 'Bruschetta', caloriesPer100g: 180, proteinPer100g: 4, carbsPer100g: 24, fatPer100g: 7, portionG: 150 },
  { slug: 'caprese', name: 'Capresesallad', caloriesPer100g: 160, proteinPer100g: 8, carbsPer100g: 4, fatPer100g: 13, portionG: 250 },
  { slug: 'pasta-arrabbiata', name: 'Pasta arrabbiata', caloriesPer100g: 140, proteinPer100g: 4, carbsPer100g: 24, fatPer100g: 3, portionG: 400 },
  { slug: 'pasta-alla-vodka', name: 'Pasta alla vodka', caloriesPer100g: 190, proteinPer100g: 6, carbsPer100g: 20, fatPer100g: 10, portionG: 350 },

  // Grekiskt/mellanöstern/turkiskt
  { slug: 'grekisk-sallad', name: 'Grekisk sallad', caloriesPer100g: 110, proteinPer100g: 4, carbsPer100g: 5, fatPer100g: 8, portionG: 300 },
  { slug: 'souvlaki', name: 'Souvlaki med pitabröd', caloriesPer100g: 200, proteinPer100g: 13, carbsPer100g: 18, fatPer100g: 9, portionG: 350 },
  { slug: 'gyrostallrik', name: 'Gyrostallrik', aliases: ['gyros'], caloriesPer100g: 180, proteinPer100g: 11, carbsPer100g: 12, fatPer100g: 10, portionG: 400 },
  { slug: 'hummus-pita', name: 'Hummus med pitabröd', caloriesPer100g: 220, proteinPer100g: 7, carbsPer100g: 26, fatPer100g: 9, portionG: 250 },
  { slug: 'shawarma', name: 'Shawarma', caloriesPer100g: 200, proteinPer100g: 10, carbsPer100g: 18, fatPer100g: 10, portionG: 350 },
  { slug: 'moussaka', name: 'Moussaka', caloriesPer100g: 160, proteinPer100g: 8, carbsPer100g: 10, fatPer100g: 10, portionG: 350 },
  { slug: 'dolmar', name: 'Dolmar (vinbladsrullar)', caloriesPer100g: 160, proteinPer100g: 3, carbsPer100g: 20, fatPer100g: 8, portionG: 250 },
  { slug: 'lahmacun', name: 'Lahmacun', caloriesPer100g: 240, proteinPer100g: 10, carbsPer100g: 32, fatPer100g: 8, portionG: 150 },
  { slug: 'pide', name: 'Pide', caloriesPer100g: 260, proteinPer100g: 11, carbsPer100g: 32, fatPer100g: 10, portionG: 250 },

  // Fler asiatiskt
  { slug: 'pho', name: 'Pho (vietnamesisk nudelsoppa)', caloriesPer100g: 90, proteinPer100g: 6, carbsPer100g: 12, fatPer100g: 2, portionG: 500 },
  { slug: 'varrullar', name: 'Vårrullar', caloriesPer100g: 220, proteinPer100g: 5, carbsPer100g: 24, fatPer100g: 11, portionG: 150 },
  { slug: 'tom-yum', name: 'Tom yum-soppa', caloriesPer100g: 50, proteinPer100g: 4, carbsPer100g: 5, fatPer100g: 1.5, portionG: 400 },
  { slug: 'thai-rod-curry', name: 'Röd curry med ris', caloriesPer100g: 140, proteinPer100g: 6, carbsPer100g: 16, fatPer100g: 6, portionG: 400 },
  { slug: 'thai-gron-curry', name: 'Grön curry med ris', caloriesPer100g: 140, proteinPer100g: 6, carbsPer100g: 16, fatPer100g: 6, portionG: 400 },
  { slug: 'bibimbap', name: 'Bibimbap', caloriesPer100g: 140, proteinPer100g: 7, carbsPer100g: 18, fatPer100g: 4.5, portionG: 400 },
  { slug: 'korean-fried-chicken', name: 'Koreansk fried chicken med ris', caloriesPer100g: 220, proteinPer100g: 12, carbsPer100g: 22, fatPer100g: 10, portionG: 400 },
  { slug: 'sotsur-kyckling', name: 'Kyckling i sursöt sås med ris', caloriesPer100g: 160, proteinPer100g: 8, carbsPer100g: 22, fatPer100g: 5, portionG: 400 },
  { slug: 'notkott-broccoli', name: 'Nötkött med broccoli i ostronsås', caloriesPer100g: 130, proteinPer100g: 10, carbsPer100g: 8, fatPer100g: 6, portionG: 400 },
  { slug: 'friterat-ris', name: 'Friterat ris', aliases: ['fried rice'], caloriesPer100g: 180, proteinPer100g: 5, carbsPer100g: 26, fatPer100g: 6, portionG: 350 },
  { slug: 'chow-mein', name: 'Chow mein', caloriesPer100g: 150, proteinPer100g: 6, carbsPer100g: 20, fatPer100g: 5, portionG: 400 },
  { slug: 'teriyaki-kyckling', name: 'Teriyakikyckling med ris', aliases: ['teriyaki'], caloriesPer100g: 160, proteinPer100g: 10, carbsPer100g: 22, fatPer100g: 3.5, portionG: 400 },
  { slug: 'katsu-curry', name: 'Katsu curry', caloriesPer100g: 200, proteinPer100g: 9, carbsPer100g: 22, fatPer100g: 8, portionG: 400 },
  { slug: 'yakisoba', name: 'Yakisoba', caloriesPer100g: 150, proteinPer100g: 6, carbsPer100g: 20, fatPer100g: 5, portionG: 400 },

  // Amerikanskt
  { slug: 'mac-and-cheese', name: 'Mac and cheese', caloriesPer100g: 210, proteinPer100g: 8, carbsPer100g: 20, fatPer100g: 11, portionG: 350 },
  { slug: 'pulled-pork-brod', name: 'BBQ pulled pork med bröd', caloriesPer100g: 240, proteinPer100g: 14, carbsPer100g: 24, fatPer100g: 9, portionG: 300 },
  { slug: 'buffalo-wings', name: 'Buffalo wings', caloriesPer100g: 250, proteinPer100g: 18, carbsPer100g: 4, fatPer100g: 18, portionG: 250 },
  { slug: 'club-sandwich', name: 'Club sandwich', caloriesPer100g: 250, proteinPer100g: 13, carbsPer100g: 22, fatPer100g: 12, portionG: 250 },
  { slug: 'amerikanska-pannkakor', name: 'Amerikanska pannkakor med lönnsirap', caloriesPer100g: 260, proteinPer100g: 6, carbsPer100g: 40, fatPer100g: 8, portionG: 200 },

  // Franskt
  { slug: 'boeuf-bourguignon', name: 'Boeuf bourguignon', caloriesPer100g: 160, proteinPer100g: 13, carbsPer100g: 6, fatPer100g: 9, portionG: 400 },
  { slug: 'quiche-lorraine', name: 'Quiche Lorraine', aliases: ['quiche'], caloriesPer100g: 240, proteinPer100g: 9, carbsPer100g: 14, fatPer100g: 17, portionG: 200 },
  { slug: 'ratatouille', name: 'Ratatouille', caloriesPer100g: 60, proteinPer100g: 1.5, carbsPer100g: 8, fatPer100g: 2.5, portionG: 350 },
  { slug: 'crepes', name: 'Crêpes', caloriesPer100g: 220, proteinPer100g: 6, carbsPer100g: 26, fatPer100g: 9, portionG: 150 },

  // Frukost/brunch
  { slug: 'smoothie-bowl', name: 'Smoothie bowl', caloriesPer100g: 100, proteinPer100g: 3, carbsPer100g: 18, fatPer100g: 2, portionG: 350 },
  { slug: 'avokadomacka', name: 'Avokadomacka', caloriesPer100g: 220, proteinPer100g: 6, carbsPer100g: 20, fatPer100g: 13, portionG: 150 },
  { slug: 'frukostwrap-agg', name: 'Frukostwrap med ägg', caloriesPer100g: 200, proteinPer100g: 11, carbsPer100g: 18, fatPer100g: 9, portionG: 200 },
  { slug: 'yoghurt-musli-bar', name: 'Yoghurt med müsli och bär', caloriesPer100g: 85, proteinPer100g: 4, carbsPer100g: 12, fatPer100g: 2.5, portionG: 300 },

  // Smörgåsar/wraps
  { slug: 'wrap-kyckling', name: 'Wrap med kyckling', caloriesPer100g: 190, proteinPer100g: 11, carbsPer100g: 20, fatPer100g: 7, portionG: 250 },
  { slug: 'blt-macka', name: 'BLT-macka', caloriesPer100g: 260, proteinPer100g: 11, carbsPer100g: 24, fatPer100g: 13, portionG: 150 },
  { slug: 'baguette-skinka-ost', name: 'Baguette med skinka och ost', caloriesPer100g: 250, proteinPer100g: 12, carbsPer100g: 32, fatPer100g: 8, portionG: 200 },

  // Fler soppor
  { slug: 'fisksoppa', name: 'Fisksoppa', caloriesPer100g: 75, proteinPer100g: 8, carbsPer100g: 5, fatPer100g: 2.5, portionG: 400 },
  { slug: 'kycklingsoppa-nudlar', name: 'Kycklingsoppa med nudlar', caloriesPer100g: 55, proteinPer100g: 5, carbsPer100g: 7, fatPer100g: 1, portionG: 400 },
  { slug: 'gulaschsoppa', name: 'Gulaschsoppa', caloriesPer100g: 90, proteinPer100g: 7, carbsPer100g: 7, fatPer100g: 3.5, portionG: 400 },
  { slug: 'svampsoppa', name: 'Svampsoppa', caloriesPer100g: 60, proteinPer100g: 2, carbsPer100g: 5, fatPer100g: 3.5, portionG: 350 },

  // Fler efterrätter/fika
  { slug: 'chokladboll', name: 'Chokladboll', caloriesPer100g: 420, proteinPer100g: 6, carbsPer100g: 45, fatPer100g: 24, portionG: 25, portionUnit: 'st' },
  { slug: 'prinsesstarta', name: 'Prinsesstårta', caloriesPer100g: 300, proteinPer100g: 4, carbsPer100g: 38, fatPer100g: 14, portionG: 100 },
  { slug: 'ostkaka', name: 'Ostkaka', caloriesPer100g: 200, proteinPer100g: 9, carbsPer100g: 18, fatPer100g: 10, portionG: 120 },
  { slug: 'appelpaj-vaniljsas', name: 'Äppelpaj med vaniljsås', caloriesPer100g: 200, proteinPer100g: 3, carbsPer100g: 30, fatPer100g: 8, portionG: 200 },
  { slug: 'glass-vanilj', name: 'Glass, vanilj', caloriesPer100g: 200, proteinPer100g: 3.5, carbsPer100g: 24, fatPer100g: 10, portionG: 100 },

  // Fler skaldjur/fisk
  { slug: 'musslor-vitvinssas', name: 'Musslor i vitvinssås', caloriesPer100g: 90, proteinPer100g: 11, carbsPer100g: 3, fatPer100g: 3.5, portionG: 400 },
  { slug: 'fiskpinnar-potatismos', name: 'Fiskpinnar med potatismos', caloriesPer100g: 190, proteinPer100g: 9, carbsPer100g: 18, fatPer100g: 9, portionG: 350 },
  { slug: 'rakmacka', name: 'Räkmacka', caloriesPer100g: 220, proteinPer100g: 10, carbsPer100g: 18, fatPer100g: 12, portionG: 150 },
  { slug: 'gravlax-dillsas', name: 'Gravlax med hovmästarsås', caloriesPer100g: 200, proteinPer100g: 16, carbsPer100g: 4, fatPer100g: 13, portionG: 150 },

  // Fler sallader/bowls
  { slug: 'couscoussallad', name: 'Couscoussallad med grönsaker', caloriesPer100g: 140, proteinPer100g: 4, carbsPer100g: 24, fatPer100g: 3.5, portionG: 350 },
  { slug: 'pastasallad', name: 'Pastasallad', caloriesPer100g: 160, proteinPer100g: 5, carbsPer100g: 22, fatPer100g: 6, portionG: 350 },
  { slug: 'quinoasallad', name: 'Quinoasallad med grönsaker', caloriesPer100g: 130, proteinPer100g: 4, carbsPer100g: 20, fatPer100g: 3.5, portionG: 350 },
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
