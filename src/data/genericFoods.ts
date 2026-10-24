// Enda källan för appens kurerade livsmedel (svenska baslivsmedel, vanliga
// rätter och restaurangprodukter). Varje rad måste också finnas i
// public.food_items — kör `npm run foods:migration` efter ändringar här, så
// genereras en migration som upsertar hela listan. portionG/portionUnit är
// bara för UI:t och sparas inte i databasen.
//
// Restaurangvärden kommer från kedjornas egna svenska näringstabeller och
// lagras per 100 g, räknat från portionens vikt och näringsvärde.

export interface GenericFood {
  slug: string
  name: string
  /** Restaurant chain or brand, shown under the name and searchable. Null/absent for plain staples. */
  brand?: string
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

export const GENERIC_FOODS: GenericFood[] = [
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
  { slug: 'majskaka', name: 'Majskaka', aliases: ['majskakor'], caloriesPer100g: 383, proteinPer100g: 7.5, carbsPer100g: 80, fatPer100g: 3, portionG: 10, portionUnit: 'st' },

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

  // Frukt
  { slug: 'mango', name: 'Mango', caloriesPer100g: 60, proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.4 },
  { slug: 'kiwi', name: 'Kiwi', caloriesPer100g: 61, proteinPer100g: 1.1, carbsPer100g: 14.7, fatPer100g: 0.5, portionG: 70, portionUnit: 'st' },
  { slug: 'druvor', name: 'Druvor', aliases: ['vindruvor'], caloriesPer100g: 69, proteinPer100g: 0.7, carbsPer100g: 18, fatPer100g: 0.2 },
  { slug: 'paron', name: 'Päron', caloriesPer100g: 57, proteinPer100g: 0.4, carbsPer100g: 15, fatPer100g: 0.1, portionG: 170, portionUnit: 'st' },
  { slug: 'blabar', name: 'Blåbär', caloriesPer100g: 57, proteinPer100g: 0.7, carbsPer100g: 14, fatPer100g: 0.3 },
  { slug: 'hallon', name: 'Hallon', caloriesPer100g: 52, proteinPer100g: 1.2, carbsPer100g: 12, fatPer100g: 0.7 },
  { slug: 'vattenmelon', name: 'Vattenmelon', caloriesPer100g: 30, proteinPer100g: 0.6, carbsPer100g: 8, fatPer100g: 0.2 },
  { slug: 'ananas', name: 'Ananas', caloriesPer100g: 50, proteinPer100g: 0.5, carbsPer100g: 13, fatPer100g: 0.1 },
  { slug: 'persika', name: 'Persika', caloriesPer100g: 39, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.3, portionG: 150, portionUnit: 'st' },
  { slug: 'plommon', name: 'Plommon', caloriesPer100g: 46, proteinPer100g: 0.7, carbsPer100g: 11, fatPer100g: 0.3, portionG: 60, portionUnit: 'st' },
  { slug: 'korsbar', name: 'Körsbär', caloriesPer100g: 63, proteinPer100g: 1.1, carbsPer100g: 16, fatPer100g: 0.2 },
  { slug: 'granatapple', name: 'Granatäpple, kärnor', aliases: ['granatäpple'], caloriesPer100g: 83, proteinPer100g: 1.7, carbsPer100g: 19, fatPer100g: 1.2 },
  { slug: 'fikon', name: 'Fikon, färska', aliases: ['fikon'], caloriesPer100g: 74, proteinPer100g: 0.8, carbsPer100g: 19, fatPer100g: 0.3, portionG: 50, portionUnit: 'st' },
  { slug: 'russin', name: 'Russin', caloriesPer100g: 299, proteinPer100g: 3.1, carbsPer100g: 79, fatPer100g: 0.5 },
  { slug: 'dadlar', name: 'Dadlar', caloriesPer100g: 282, proteinPer100g: 2.5, carbsPer100g: 75, fatPer100g: 0.4 },

  // Grönsaker
  { slug: 'lok', name: 'Lök', aliases: ['gul lök'], caloriesPer100g: 40, proteinPer100g: 1.1, carbsPer100g: 9.3, fatPer100g: 0.1 },
  { slug: 'paprika', name: 'Paprika', caloriesPer100g: 31, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.3 },
  { slug: 'sallad-isberg', name: 'Sallad, isberg', aliases: ['sallad'], caloriesPer100g: 14, proteinPer100g: 0.9, carbsPer100g: 3, fatPer100g: 0.1 },
  { slug: 'blomkal-kokt', name: 'Blomkål, kokt', aliases: ['blomkål'], caloriesPer100g: 25, proteinPer100g: 1.9, carbsPer100g: 5, fatPer100g: 0.3 },
  { slug: 'mais', name: 'Majs', caloriesPer100g: 86, proteinPer100g: 3.3, carbsPer100g: 19, fatPer100g: 1.4 },
  { slug: 'spenat', name: 'Spenat', caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4 },
  { slug: 'zucchini', name: 'Zucchini', caloriesPer100g: 17, proteinPer100g: 1.2, carbsPer100g: 3.1, fatPer100g: 0.3 },
  { slug: 'aubergine-kokt', name: 'Aubergine, kokt', aliases: ['aubergine'], caloriesPer100g: 25, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.2 },
  { slug: 'rodkal', name: 'Rödkål', caloriesPer100g: 31, proteinPer100g: 1.4, carbsPer100g: 7.4, fatPer100g: 0.2 },
  { slug: 'vitkal', name: 'Vitkål', caloriesPer100g: 25, proteinPer100g: 1.3, carbsPer100g: 5.8, fatPer100g: 0.1 },
  { slug: 'purjolok', name: 'Purjolök', caloriesPer100g: 61, proteinPer100g: 1.5, carbsPer100g: 14, fatPer100g: 0.3 },
  { slug: 'rodbetor-kokta', name: 'Rödbetor, kokta', aliases: ['rödbetor'], caloriesPer100g: 44, proteinPer100g: 1.6, carbsPer100g: 10, fatPer100g: 0.2 },
  { slug: 'sotpotatis-kokt', name: 'Sötpotatis, kokt', aliases: ['sötpotatis'], caloriesPer100g: 90, proteinPer100g: 2, carbsPer100g: 21, fatPer100g: 0.1 },
  { slug: 'champinjoner', name: 'Champinjoner', aliases: ['svamp'], caloriesPer100g: 22, proteinPer100g: 3.1, carbsPer100g: 3.3, fatPer100g: 0.3 },
  { slug: 'sparris-kokt', name: 'Sparris, kokt', aliases: ['sparris'], caloriesPer100g: 22, proteinPer100g: 2.4, carbsPer100g: 4.1, fatPer100g: 0.2 },
  { slug: 'selleri', name: 'Selleri', caloriesPer100g: 16, proteinPer100g: 0.7, carbsPer100g: 3, fatPer100g: 0.2 },
  { slug: 'radisor', name: 'Rädisor', caloriesPer100g: 16, proteinPer100g: 0.7, carbsPer100g: 3.4, fatPer100g: 0.1 },
  { slug: 'brysselkal-kokt', name: 'Brysselkål, kokt', aliases: ['brysselkål'], caloriesPer100g: 43, proteinPer100g: 3.4, carbsPer100g: 7, fatPer100g: 0.4 },

  // Mejeri
  { slug: 'kvarg-naturell', name: 'Kvarg, naturell', aliases: ['kvarg'], caloriesPer100g: 60, proteinPer100g: 12, carbsPer100g: 3.8, fatPer100g: 0.2 },
  { slug: 'gradde-vispgradde', name: 'Vispgrädde', aliases: ['grädde'], caloriesPer100g: 340, proteinPer100g: 2.1, carbsPer100g: 3, fatPer100g: 36 },
  { slug: 'cremefraiche', name: 'Crème fraîche', aliases: ['gräddfil'], caloriesPer100g: 300, proteinPer100g: 2.4, carbsPer100g: 3.9, fatPer100g: 30 },
  { slug: 'mozzarella', name: 'Mozzarella', caloriesPer100g: 280, proteinPer100g: 22, carbsPer100g: 2.2, fatPer100g: 21 },
  { slug: 'parmesan', name: 'Parmesan', caloriesPer100g: 392, proteinPer100g: 35, carbsPer100g: 3.2, fatPer100g: 26 },
  { slug: 'feta', name: 'Feta', caloriesPer100g: 264, proteinPer100g: 14, carbsPer100g: 4, fatPer100g: 21 },
  { slug: 'cheddar', name: 'Cheddar', caloriesPer100g: 402, proteinPer100g: 25, carbsPer100g: 1.3, fatPer100g: 33 },
  { slug: 'skyr', name: 'Skyr', caloriesPer100g: 63, proteinPer100g: 11, carbsPer100g: 4, fatPer100g: 0.2 },
  { slug: 'aggvita', name: 'Äggvita', caloriesPer100g: 52, proteinPer100g: 11, carbsPer100g: 0.7, fatPer100g: 0.2 },

  // Nötter/frön
  { slug: 'cashewnotter', name: 'Cashewnötter', caloriesPer100g: 553, proteinPer100g: 18, carbsPer100g: 30, fatPer100g: 44 },
  { slug: 'valnotter', name: 'Valnötter', caloriesPer100g: 654, proteinPer100g: 15, carbsPer100g: 14, fatPer100g: 65 },
  { slug: 'hasselnotter', name: 'Hasselnötter', caloriesPer100g: 628, proteinPer100g: 15, carbsPer100g: 17, fatPer100g: 61 },
  { slug: 'pistagenotter', name: 'Pistagenötter', caloriesPer100g: 560, proteinPer100g: 20, carbsPer100g: 28, fatPer100g: 45 },
  { slug: 'solrosfron', name: 'Solrosfrön', caloriesPer100g: 584, proteinPer100g: 21, carbsPer100g: 20, fatPer100g: 51 },
  { slug: 'chiafron', name: 'Chiafrön', caloriesPer100g: 486, proteinPer100g: 17, carbsPer100g: 42, fatPer100g: 31 },
  { slug: 'pumpafron', name: 'Pumpafrön', caloriesPer100g: 559, proteinPer100g: 30, carbsPer100g: 11, fatPer100g: 49 },

  // Kolhydrater/gryn
  { slug: 'quinoa-kokt', name: 'Quinoa, kokt', aliases: ['quinoa'], caloriesPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 21, fatPer100g: 1.9 },
  { slug: 'couscous-kokt', name: 'Couscous, kokt', aliases: ['couscous'], caloriesPer100g: 112, proteinPer100g: 3.8, carbsPer100g: 23, fatPer100g: 0.2 },
  { slug: 'bulgur-kokt', name: 'Bulgur, kokt', aliases: ['bulgur'], caloriesPer100g: 83, proteinPer100g: 3.1, carbsPer100g: 19, fatPer100g: 0.2 },
  { slug: 'ris-fullkorn-kokt', name: 'Ris, fullkorn, kokt', aliases: ['fullkornsris', 'brunt ris'], caloriesPer100g: 111, proteinPer100g: 2.6, carbsPer100g: 23, fatPer100g: 0.9 },
  { slug: 'knackebrod', name: 'Knäckebröd', caloriesPer100g: 336, proteinPer100g: 9, carbsPer100g: 70, fatPer100g: 1.5 },
  { slug: 'musli', name: 'Müsli', aliases: ['musli'], caloriesPer100g: 375, proteinPer100g: 9, carbsPer100g: 65, fatPer100g: 8 },
  { slug: 'cornflakes', name: 'Cornflakes', caloriesPer100g: 378, proteinPer100g: 7, carbsPer100g: 84, fatPer100g: 0.9 },
  { slug: 'tortillabrod', name: 'Tortillabröd', aliases: ['tortilla'], caloriesPer100g: 289, proteinPer100g: 8, carbsPer100g: 48, fatPer100g: 7 },
  { slug: 'riskakor', name: 'Riskakor', caloriesPer100g: 387, proteinPer100g: 8, carbsPer100g: 82, fatPer100g: 2.8 },

  // Baljväxter
  { slug: 'svarta-bonor-kokta', name: 'Svarta bönor, kokta', aliases: ['svarta bönor'], caloriesPer100g: 132, proteinPer100g: 8.9, carbsPer100g: 24, fatPer100g: 0.5 },
  { slug: 'kidneybonor-kokta', name: 'Kidneybönor, kokta', aliases: ['kidneybönor'], caloriesPer100g: 127, proteinPer100g: 8.7, carbsPer100g: 23, fatPer100g: 0.5 },
  { slug: 'gula-artor-kokta', name: 'Gula ärtor, kokta', aliases: ['gula ärtor'], caloriesPer100g: 118, proteinPer100g: 8, carbsPer100g: 21, fatPer100g: 0.4 },
  { slug: 'edamame', name: 'Edamame', caloriesPer100g: 121, proteinPer100g: 11, carbsPer100g: 9.9, fatPer100g: 5.2 },

  // Protein/kött/fisk
  { slug: 'kalkonfile', name: 'Kalkonfilé, tillagad', aliases: ['kalkon'], caloriesPer100g: 135, proteinPer100g: 30, carbsPer100g: 0, fatPer100g: 1 },
  { slug: 'bacon-stekt', name: 'Bacon, stekt', aliases: ['bacon'], caloriesPer100g: 541, proteinPer100g: 37, carbsPer100g: 1.3, fatPer100g: 42 },
  { slug: 'kokt-skinka', name: 'Skinka, kokt', aliases: ['skinka'], caloriesPer100g: 145, proteinPer100g: 21, carbsPer100g: 1.5, fatPer100g: 5.5 },
  { slug: 'tonfisk-konserv', name: 'Tonfisk, konserv i vatten', aliases: ['tonfisk'], caloriesPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 0.8 },
  { slug: 'sardiner-konserv', name: 'Sardiner, konserv', aliases: ['sardiner'], caloriesPer100g: 208, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 11 },
  { slug: 'kycklinglarfile', name: 'Kycklinglårfilé, tillagad', aliases: ['kycklinglår'], caloriesPer100g: 177, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 8 },
  { slug: 'oxfile-tillagad', name: 'Oxfilé, tillagad', aliases: ['oxfilé'], caloriesPer100g: 250, proteinPer100g: 27, carbsPer100g: 0, fatPer100g: 15 },
  { slug: 'chorizo', name: 'Chorizo', caloriesPer100g: 455, proteinPer100g: 24, carbsPer100g: 2, fatPer100g: 38 },

  // Såser/fetter/kryddor
  { slug: 'ketchup', name: 'Ketchup', caloriesPer100g: 112, proteinPer100g: 1.2, carbsPer100g: 27, fatPer100g: 0.2 },
  { slug: 'senap', name: 'Senap', caloriesPer100g: 100, proteinPer100g: 5, carbsPer100g: 8, fatPer100g: 5 },
  { slug: 'majonnas', name: 'Majonnäs', aliases: ['majonäs'], caloriesPer100g: 680, proteinPer100g: 1, carbsPer100g: 1, fatPer100g: 75 },
  { slug: 'sojasas', name: 'Sojasås', aliases: ['soja'], caloriesPer100g: 60, proteinPer100g: 6, carbsPer100g: 6, fatPer100g: 0 },
  { slug: 'honung', name: 'Honung', caloriesPer100g: 304, proteinPer100g: 0.3, carbsPer100g: 82, fatPer100g: 0 },
  { slug: 'bbq-sas', name: 'BBQ-sås', caloriesPer100g: 172, proteinPer100g: 1, carbsPer100g: 40, fatPer100g: 0.5 },
  { slug: 'rapsolja', name: 'Rapsolja', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100 },
  { slug: 'kokosolja', name: 'Kokosolja', caloriesPer100g: 862, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100 },

  // Snacks/godis
  { slug: 'chips', name: 'Chips', caloriesPer100g: 536, proteinPer100g: 6.6, carbsPer100g: 53, fatPer100g: 34 },
  { slug: 'popcorn', name: 'Popcorn', caloriesPer100g: 387, proteinPer100g: 12, carbsPer100g: 78, fatPer100g: 4.5 },
  { slug: 'choklad-mjolk', name: 'Choklad, mjölk', aliases: ['choklad'], caloriesPer100g: 535, proteinPer100g: 7.3, carbsPer100g: 59, fatPer100g: 30 },
  { slug: 'choklad-mork', name: 'Choklad, mörk', caloriesPer100g: 546, proteinPer100g: 7.8, carbsPer100g: 46, fatPer100g: 31 },
  { slug: 'kex-digestive', name: 'Digestivekex', aliases: ['kex'], caloriesPer100g: 471, proteinPer100g: 7, carbsPer100g: 62, fatPer100g: 21 },
  { slug: 'proteinbar', name: 'Proteinbar', caloriesPer100g: 380, proteinPer100g: 30, carbsPer100g: 35, fatPer100g: 12 },
  { slug: 'lakrits', name: 'Lakrits', caloriesPer100g: 350, proteinPer100g: 2, carbsPer100g: 85, fatPer100g: 0.5 },
  { slug: 'gott-och-blandat', name: 'Gott & blandat', aliases: ['godis'], caloriesPer100g: 340, proteinPer100g: 5, carbsPer100g: 78, fatPer100g: 0 },

  // Fler vardagsrätter/frukost/efterrätt
  { slug: 'aggrora', name: 'Äggröra', caloriesPer100g: 145, proteinPer100g: 12, carbsPer100g: 1, fatPer100g: 10, portionG: 150 },
  { slug: 'stekt-agg', name: 'Stekt ägg', caloriesPer100g: 196, proteinPer100g: 14, carbsPer100g: 0.6, fatPer100g: 15, portionG: 60, portionUnit: 'st' },
  { slug: 'fransk-toast', name: 'Fransk toast', caloriesPer100g: 229, proteinPer100g: 8, carbsPer100g: 24, fatPer100g: 11, portionG: 150 },
  { slug: 'smorgastarta', name: 'Smörgåstårta', caloriesPer100g: 220, proteinPer100g: 7, carbsPer100g: 15, fatPer100g: 15, portionG: 100 },
  { slug: 'morotskaka', name: 'Morotskaka', caloriesPer100g: 350, proteinPer100g: 4, carbsPer100g: 40, fatPer100g: 19, portionG: 90 },
  { slug: 'chokladtarta', name: 'Chokladtårta', caloriesPer100g: 380, proteinPer100g: 5, carbsPer100g: 42, fatPer100g: 21, portionG: 90 },
  { slug: 'cheesecake', name: 'Cheesecake', caloriesPer100g: 321, proteinPer100g: 5, carbsPer100g: 26, fatPer100g: 22, portionG: 90 },
  { slug: 'tiramisu', name: 'Tiramisu', caloriesPer100g: 283, proteinPer100g: 5, carbsPer100g: 29, fatPer100g: 16, portionG: 120 },
  { slug: 'panna-cotta', name: 'Panna cotta', caloriesPer100g: 250, proteinPer100g: 3, carbsPer100g: 20, fatPer100g: 17, portionG: 120 },
  { slug: 'paella', name: 'Paella', caloriesPer100g: 160, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 5, portionG: 400 },
  { slug: 'goulash-ungersk', name: 'Ungersk gulasch', aliases: ['gulasch'], caloriesPer100g: 130, proteinPer100g: 9, carbsPer100g: 8, fatPer100g: 6.5, portionG: 400 },
  { slug: 'falafeltallrik', name: 'Falafeltallrik', caloriesPer100g: 190, proteinPer100g: 7, carbsPer100g: 20, fatPer100g: 8, portionG: 350 },
  { slug: 'chicken-nuggets', name: 'Chicken nuggets', caloriesPer100g: 296, proteinPer100g: 15, carbsPer100g: 16, fatPer100g: 19, portionG: 200 },
  { slug: 'proteinshake', name: 'Proteinshake', caloriesPer100g: 110, proteinPer100g: 20, carbsPer100g: 4, fatPer100g: 1.5, portionG: 300 },
  { slug: 'smoothie-frukt', name: 'Fruktsmoothie', aliases: ['smoothie'], caloriesPer100g: 60, proteinPer100g: 1, carbsPer100g: 14, fatPer100g: 0.2, portionG: 300 },
  { slug: 'risgrynsgrot', name: 'Risgrynsgröt', aliases: ['risgrynsgröt'], caloriesPer100g: 120, proteinPer100g: 3, carbsPer100g: 20, fatPer100g: 3, portionG: 300 },

  // Fler ikoniska svenska rätter
  { slug: 'pannbiff-lok', name: 'Pannbiff med lök och gräddsås', aliases: ['pannbiff'], caloriesPer100g: 220, proteinPer100g: 14, carbsPer100g: 8, fatPer100g: 15, portionG: 350 },
  { slug: 'flygande-jacob', name: 'Flygande Jacob', caloriesPer100g: 280, proteinPer100g: 15, carbsPer100g: 8, fatPer100g: 21, portionG: 350 },
  { slug: 'leverpastejmacka', name: 'Leverpastejmacka', caloriesPer100g: 260, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 16, portionG: 100 },
  { slug: 'jagarschnitzel', name: 'Jägarschnitzel med svampsås', aliases: ['jägarschnitzel'], caloriesPer100g: 210, proteinPer100g: 13, carbsPer100g: 10, fatPer100g: 13, portionG: 350 },
  { slug: 'kokt-flasklagg-rotmos', name: 'Kokt fläsklägg med rotmos', aliases: ['fläsklägg'], caloriesPer100g: 220, proteinPer100g: 14, carbsPer100g: 10, fatPer100g: 14, portionG: 400 },
  { slug: 'fransk-loksoppa', name: 'Fransk löksoppa', aliases: ['löksoppa'], caloriesPer100g: 70, proteinPer100g: 3, carbsPer100g: 7, fatPer100g: 3, portionG: 350 },
  { slug: 'biff-lindstrom', name: 'Biff Lindström', caloriesPer100g: 230, proteinPer100g: 13, carbsPer100g: 10, fatPer100g: 15, portionG: 300 },

  // Växtbaserade alternativ
  { slug: 'havremjolk', name: 'Havremjölk', caloriesPer100g: 47, proteinPer100g: 1, carbsPer100g: 7.5, fatPer100g: 1.5 },
  { slug: 'mandelmjolk', name: 'Mandelmjölk, osötad', aliases: ['mandelmjölk'], caloriesPer100g: 13, proteinPer100g: 0.5, carbsPer100g: 0.3, fatPer100g: 1.1 },
  { slug: 'sojamjolk', name: 'Sojamjölk', caloriesPer100g: 33, proteinPer100g: 3.3, carbsPer100g: 0.5, fatPer100g: 1.8 },
  { slug: 'vegofars', name: 'Vegofärs', caloriesPer100g: 170, proteinPer100g: 18, carbsPer100g: 7, fatPer100g: 7 },
  { slug: 'vegokorv', name: 'Vegokorv', caloriesPer100g: 180, proteinPer100g: 15, carbsPer100g: 10, fatPer100g: 9 },
  { slug: 'seitan', name: 'Seitan, tillagad', caloriesPer100g: 120, proteinPer100g: 21, carbsPer100g: 4, fatPer100g: 1.9 },

  // Fler grönsaker
  { slug: 'vitlok', name: 'Vitlök', caloriesPer100g: 149, proteinPer100g: 6.4, carbsPer100g: 33, fatPer100g: 0.5 },
  { slug: 'ingefara', name: 'Ingefära', caloriesPer100g: 80, proteinPer100g: 1.8, carbsPer100g: 18, fatPer100g: 0.8 },
  { slug: 'chili', name: 'Chili', caloriesPer100g: 40, proteinPer100g: 1.9, carbsPer100g: 9, fatPer100g: 0.4 },
  { slug: 'rodlok', name: 'Rödlök', caloriesPer100g: 40, proteinPer100g: 1.1, carbsPer100g: 9.3, fatPer100g: 0.1 },
  { slug: 'sockerartor', name: 'Sockerärtor', caloriesPer100g: 42, proteinPer100g: 2.8, carbsPer100g: 7.5, fatPer100g: 0.2 },
  { slug: 'kronartskocka', name: 'Kronärtskocka', caloriesPer100g: 47, proteinPer100g: 3.3, carbsPer100g: 10.5, fatPer100g: 0.2 },
  { slug: 'fankal', name: 'Fänkål', caloriesPer100g: 31, proteinPer100g: 1.2, carbsPer100g: 7.3, fatPer100g: 0.2 },

  // Fler frukter
  { slug: 'citron', name: 'Citron', caloriesPer100g: 29, proteinPer100g: 1.1, carbsPer100g: 9.3, fatPer100g: 0.3 },
  { slug: 'lime', name: 'Lime', caloriesPer100g: 30, proteinPer100g: 0.7, carbsPer100g: 10.5, fatPer100g: 0.2 },
  { slug: 'nektarin', name: 'Nektarin', caloriesPer100g: 44, proteinPer100g: 1.1, carbsPer100g: 10.5, fatPer100g: 0.3, portionG: 140, portionUnit: 'st' },
  { slug: 'passionsfrukt', name: 'Passionsfrukt', caloriesPer100g: 97, proteinPer100g: 2.2, carbsPer100g: 23, fatPer100g: 0.4 },
  { slug: 'aprikos-torkad', name: 'Aprikoser, torkade', aliases: ['torkad aprikos'], caloriesPer100g: 241, proteinPer100g: 3.4, carbsPer100g: 63, fatPer100g: 0.5 },

  // Fler fisk/skaldjur
  { slug: 'rokt-lax', name: 'Rökt lax', caloriesPer100g: 117, proteinPer100g: 18, carbsPer100g: 0, fatPer100g: 4.3 },
  { slug: 'makrill', name: 'Makrill', caloriesPer100g: 205, proteinPer100g: 19, carbsPer100g: 0, fatPer100g: 14 },
  { slug: 'sej', name: 'Sej, tillagad', caloriesPer100g: 105, proteinPer100g: 23, carbsPer100g: 0, fatPer100g: 1 },
  { slug: 'kolja', name: 'Kolja, tillagad', caloriesPer100g: 90, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 0.7 },
  { slug: 'tilapia', name: 'Tilapia, tillagad', caloriesPer100g: 128, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 3 },

  // Bröd
  { slug: 'ragbrod', name: 'Rågbröd', caloriesPer100g: 259, proteinPer100g: 8, carbsPer100g: 48, fatPer100g: 2 },
  { slug: 'surdegsbrod', name: 'Surdegsbröd', caloriesPer100g: 260, proteinPer100g: 9, carbsPer100g: 50, fatPer100g: 1.5 },
  { slug: 'hamburgerbrod', name: 'Hamburgerbröd', caloriesPer100g: 280, proteinPer100g: 9, carbsPer100g: 50, fatPer100g: 5, portionG: 60, portionUnit: 'st' },

  // Drycker
  { slug: 'ol-folkol', name: 'Öl, folköl', caloriesPer100g: 40, proteinPer100g: 0.4, carbsPer100g: 3.5, fatPer100g: 0 },
  { slug: 'ol-starkol', name: 'Öl, starköl/lager', aliases: ['öl'], caloriesPer100g: 43, proteinPer100g: 0.4, carbsPer100g: 3.5, fatPer100g: 0 },
  { slug: 'vin-rott', name: 'Vin, rött', caloriesPer100g: 85, proteinPer100g: 0.1, carbsPer100g: 2.6, fatPer100g: 0 },
  { slug: 'vin-vitt', name: 'Vin, vitt', caloriesPer100g: 82, proteinPer100g: 0.1, carbsPer100g: 2.6, fatPer100g: 0 },
  { slug: 'lask-cola', name: 'Läsk/cola', aliases: ['cola', 'läsk'], caloriesPer100g: 42, proteinPer100g: 0, carbsPer100g: 10.6, fatPer100g: 0 },
  { slug: 'lask-light', name: 'Lightläsk', aliases: ['cola light'], caloriesPer100g: 1, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0 },
  { slug: 'energidryck', name: 'Energidryck', caloriesPer100g: 45, proteinPer100g: 0, carbsPer100g: 11, fatPer100g: 0 },

  // Matlagningsbas
  { slug: 'kokosmjolk', name: 'Kokosmjölk', caloriesPer100g: 197, proteinPer100g: 2.3, carbsPer100g: 2.8, fatPer100g: 21 },
  { slug: 'buljong', name: 'Buljong, färdig', caloriesPer100g: 5, proteinPer100g: 0.5, carbsPer100g: 0.5, fatPer100g: 0.2 },
  { slug: 'krossade-tomater', name: 'Krossade tomater, konserv', caloriesPer100g: 24, proteinPer100g: 1.2, carbsPer100g: 4.5, fatPer100g: 0.2 },
  { slug: 'tomatpure', name: 'Tomatpuré', caloriesPer100g: 82, proteinPer100g: 4.3, carbsPer100g: 17, fatPer100g: 0.5 },

  // Fler kötträtter
  { slug: 'korvgryta', name: 'Korvgryta med potatis', caloriesPer100g: 160, proteinPer100g: 7, carbsPer100g: 14, fatPer100g: 8, portionG: 400 },
  { slug: 'kalvfile-stroganoff', name: 'Kalvfilé stroganoff med ris', caloriesPer100g: 190, proteinPer100g: 13, carbsPer100g: 15, fatPer100g: 9, portionG: 400 },
  { slug: 'lammgryta', name: 'Lammgryta med rotfrukter', caloriesPer100g: 160, proteinPer100g: 12, carbsPer100g: 10, fatPer100g: 8, portionG: 400 },
  { slug: 'lammkotletter', name: 'Lammkotletter, tillagade', caloriesPer100g: 294, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 21 },
  { slug: 'entrecote', name: 'Entrecote, tillagad', caloriesPer100g: 250, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 16 },
  { slug: 'flaskkarre', name: 'Fläskkarré, tillagad', caloriesPer100g: 210, proteinPer100g: 27, carbsPer100g: 0, fatPer100g: 11 },

  // Frukost
  { slug: 'fiberflingor', name: 'Fiberrika frukostflingor', caloriesPer100g: 350, proteinPer100g: 10, carbsPer100g: 68, fatPer100g: 3 },
  { slug: 'fralla', name: 'Frukostfralla', caloriesPer100g: 270, proteinPer100g: 9, carbsPer100g: 48, fatPer100g: 4.5, portionG: 60, portionUnit: 'st' },

  // Fler nötter/frön
  { slug: 'jordnotter-rostade', name: 'Jordnötter, rostade', aliases: ['jordnötter'], caloriesPer100g: 567, proteinPer100g: 25, carbsPer100g: 16, fatPer100g: 49 },
  { slug: 'pinjenotter', name: 'Pinjenötter', caloriesPer100g: 673, proteinPer100g: 14, carbsPer100g: 13, fatPer100g: 68 },
  { slug: 'sesamfron', name: 'Sesamfrön', caloriesPer100g: 573, proteinPer100g: 18, carbsPer100g: 23, fatPer100g: 50 },
  { slug: 'linfron', name: 'Linfrön', caloriesPer100g: 534, proteinPer100g: 18, carbsPer100g: 29, fatPer100g: 42 },

  // Fler internationella rätter
  { slug: 'enchiladas', name: 'Enchiladas med kött', caloriesPer100g: 190, proteinPer100g: 10, carbsPer100g: 18, fatPer100g: 9, portionG: 350 },
  { slug: 'fajitas-kyckling', name: 'Fajitas med kyckling', caloriesPer100g: 170, proteinPer100g: 12, carbsPer100g: 15, fatPer100g: 7, portionG: 350 },
  { slug: 'caesarwrap', name: 'Caesarwrap', caloriesPer100g: 220, proteinPer100g: 11, carbsPer100g: 20, fatPer100g: 10, portionG: 250 },
  { slug: 'laksa', name: 'Laksa', caloriesPer100g: 130, proteinPer100g: 7, carbsPer100g: 12, fatPer100g: 6, portionG: 500 },
  { slug: 'anka-hoisin', name: 'Anka i hoisinsås med ris', caloriesPer100g: 210, proteinPer100g: 10, carbsPer100g: 20, fatPer100g: 9, portionG: 400 },
  { slug: 'ceviche', name: 'Ceviche', caloriesPer100g: 100, proteinPer100g: 15, carbsPer100g: 5, fatPer100g: 2, portionG: 250 },
  { slug: 'empanadas', name: 'Empanadas', caloriesPer100g: 260, proteinPer100g: 8, carbsPer100g: 26, fatPer100g: 13, portionG: 200 },

  // Fler efterrätter
  { slug: 'creme-brulee', name: 'Crème brûlée', caloriesPer100g: 300, proteinPer100g: 4, carbsPer100g: 25, fatPer100g: 20, portionG: 100 },
  { slug: 'macarons', name: 'Macarons', caloriesPer100g: 400, proteinPer100g: 6, carbsPer100g: 55, fatPer100g: 18, portionG: 8, portionUnit: 'st' },
  { slug: 'brownie', name: 'Brownie', caloriesPer100g: 430, proteinPer100g: 5, carbsPer100g: 50, fatPer100g: 23, portionG: 60 },

  // Specialkost
  { slug: 'glutenfritt-brod', name: 'Glutenfritt bröd', caloriesPer100g: 240, proteinPer100g: 4, carbsPer100g: 45, fatPer100g: 3 },
  { slug: 'laktosfri-mjolk', name: 'Laktosfri mjölk', caloriesPer100g: 46, proteinPer100g: 3.4, carbsPer100g: 4.9, fatPer100g: 1.5 },

  // Kött och chark
  { slug: 'blandfars-tillagad', name: 'Blandfärs, tillagad', aliases: ['köttfärs'], caloriesPer100g: 250, proteinPer100g: 24, carbsPer100g: 0, fatPer100g: 17 },
  { slug: 'flaskfars-tillagad', name: 'Fläskfärs, tillagad', caloriesPer100g: 270, proteinPer100g: 24, carbsPer100g: 0, fatPer100g: 19 },
  { slug: 'kycklingfars-tillagad', name: 'Kycklingfärs, tillagad', caloriesPer100g: 170, proteinPer100g: 24, carbsPer100g: 0, fatPer100g: 8 },
  { slug: 'lammfars-tillagad', name: 'Lammfärs, tillagad', caloriesPer100g: 280, proteinPer100g: 24, carbsPer100g: 0, fatPer100g: 20 },
  { slug: 'notfars-5', name: 'Nötfärs 5%, tillagad', aliases: ['nötfärs', 'köttfärs'], caloriesPer100g: 170, proteinPer100g: 28, carbsPer100g: 0, fatPer100g: 6.5 },
  { slug: 'hamburgerbiff-stekt', name: 'Hamburgerbiff, stekt', caloriesPer100g: 250, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 17, portionG: 90, portionUnit: 'st' },
  { slug: 'grillkorv', name: 'Grillkorv', aliases: ['korv'], caloriesPer100g: 250, proteinPer100g: 11, carbsPer100g: 4, fatPer100g: 21, portionG: 60, portionUnit: 'st' },
  { slug: 'wienerkorv', name: 'Wienerkorv', aliases: ['korv', 'varmkorv'], caloriesPer100g: 240, proteinPer100g: 11, carbsPer100g: 3, fatPer100g: 20, portionG: 50, portionUnit: 'st' },
  { slug: 'salami', name: 'Salami', caloriesPer100g: 420, proteinPer100g: 22, carbsPer100g: 1, fatPer100g: 37 },
  { slug: 'lufttorkad-skinka', name: 'Lufttorkad skinka', aliases: ['prosciutto', 'serranoskinka'], caloriesPer100g: 250, proteinPer100g: 28, carbsPer100g: 0, fatPer100g: 16 },
  { slug: 'kalkonpalagg', name: 'Kalkonpålägg', caloriesPer100g: 105, proteinPer100g: 18, carbsPer100g: 2, fatPer100g: 2.5 },
  { slug: 'kycklingpalagg', name: 'Kycklingpålägg', caloriesPer100g: 110, proteinPer100g: 18, carbsPer100g: 2, fatPer100g: 3 },
  { slug: 'rostbiff-palagg', name: 'Rostbiff, pålägg', caloriesPer100g: 120, proteinPer100g: 21, carbsPer100g: 0.5, fatPer100g: 4 },
  { slug: 'leverpastej', name: 'Leverpastej', caloriesPer100g: 260, proteinPer100g: 10, carbsPer100g: 7, fatPer100g: 21 },
  { slug: 'kassler', name: 'Kassler', caloriesPer100g: 130, proteinPer100g: 19, carbsPer100g: 1, fatPer100g: 5.5 },
  { slug: 'kebabkott', name: 'Kebabkött', caloriesPer100g: 250, proteinPer100g: 17, carbsPer100g: 3, fatPer100g: 19 },
  { slug: 'pulled-pork', name: 'Pulled pork', caloriesPer100g: 200, proteinPer100g: 22, carbsPer100g: 5, fatPer100g: 10 },
  { slug: 'kycklingvingar-tillagade', name: 'Kycklingvingar, tillagade', caloriesPer100g: 250, proteinPer100g: 24, carbsPer100g: 0, fatPer100g: 17 },
  { slug: 'kycklingklubbor-tillagade', name: 'Kycklingklubbor, tillagade', caloriesPer100g: 200, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 10 },
  { slug: 'grillad-kyckling-med-skinn', name: 'Grillad kyckling med skinn', aliases: ['helgrillad kyckling'], caloriesPer100g: 215, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 12 },

  // Fisk och skaldjur
  { slug: 'torskfile-tillagad', name: 'Torskfilé, tillagad', aliases: ['torsk'], caloriesPer100g: 105, proteinPer100g: 23, carbsPer100g: 0, fatPer100g: 1 },
  { slug: 'laxfile-ra', name: 'Laxfilé, rå', aliases: ['lax'], caloriesPer100g: 200, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13 },
  { slug: 'tonfisk-i-olja-konserv', name: 'Tonfisk i olja, konserv', aliases: ['tonfisk'], caloriesPer100g: 190, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 9.5 },
  { slug: 'inlagd-sill', name: 'Inlagd sill', aliases: ['sill'], caloriesPer100g: 210, proteinPer100g: 8, carbsPer100g: 18, fatPer100g: 12 },
  { slug: 'kaviar-tubkaviar', name: 'Kaviar, tubkaviar', aliases: ['kalles'], caloriesPer100g: 450, proteinPer100g: 11, carbsPer100g: 11, fatPer100g: 40 },
  { slug: 'krabbstanger-surimi', name: 'Krabbstänger (surimi)', caloriesPer100g: 95, proteinPer100g: 8, carbsPer100g: 14, fatPer100g: 0.6 },
  { slug: 'panerad-fiskfile-ugnsbakad', name: 'Panerad fiskfilé, ugnsbakad', caloriesPer100g: 200, proteinPer100g: 12, carbsPer100g: 17, fatPer100g: 9 },
  { slug: 'fiskbullar', name: 'Fiskbullar', caloriesPer100g: 75, proteinPer100g: 7, carbsPer100g: 6, fatPer100g: 2.5 },

  // Mejeri och ägg
  { slug: 'mellanmjolk-1-5', name: 'Mellanmjölk 1.5%', aliases: ['mjölk'], caloriesPer100g: 46, proteinPer100g: 3.5, carbsPer100g: 4.8, fatPer100g: 1.5 },
  { slug: 'grekisk-yoghurt-10', name: 'Grekisk yoghurt 10%', aliases: ['turkisk yoghurt', 'yoghurt'], caloriesPer100g: 120, proteinPer100g: 4, carbsPer100g: 4, fatPer100g: 10 },
  { slug: 'vaniljyoghurt', name: 'Vaniljyoghurt', aliases: ['yoghurt'], caloriesPer100g: 95, proteinPer100g: 3.3, carbsPer100g: 13, fatPer100g: 3 },
  { slug: 'fruktyoghurt', name: 'Fruktyoghurt', aliases: ['yoghurt'], caloriesPer100g: 90, proteinPer100g: 3.2, carbsPer100g: 13, fatPer100g: 2.8 },
  { slug: 'proteinyoghurt', name: 'Proteinyoghurt', aliases: ['yoghurt'], caloriesPer100g: 65, proteinPer100g: 10, carbsPer100g: 4, fatPer100g: 0.5 },
  { slug: 'vaniljkvarg', name: 'Vaniljkvarg', aliases: ['kvarg'], caloriesPer100g: 75, proteinPer100g: 10, carbsPer100g: 7, fatPer100g: 0.5 },
  { slug: 'proteinpudding', name: 'Proteinpudding', caloriesPer100g: 80, proteinPer100g: 10, carbsPer100g: 7, fatPer100g: 1.5 },
  { slug: 'kesella', name: 'Kesella', caloriesPer100g: 75, proteinPer100g: 8, carbsPer100g: 4, fatPer100g: 3 },
  { slug: 'graddfil-12', name: 'Gräddfil 12%', aliases: ['gräddfil'], caloriesPer100g: 140, proteinPer100g: 3, carbsPer100g: 4, fatPer100g: 12 },
  { slug: 'matlagningsgradde-15', name: 'Matlagningsgrädde 15%', aliases: ['grädde'], caloriesPer100g: 160, proteinPer100g: 3, carbsPer100g: 4, fatPer100g: 15 },
  { slug: 'bregott-margarin', name: 'Bregott/margarin', aliases: ['margarin', 'bregott'], caloriesPer100g: 680, proteinPer100g: 0.5, carbsPer100g: 0.5, fatPer100g: 75 },
  { slug: 'lattmargarin-40', name: 'Lättmargarin 40%', aliases: ['margarin', 'lätt bregott'], caloriesPer100g: 360, proteinPer100g: 0.5, carbsPer100g: 0.5, fatPer100g: 40 },
  { slug: 'farskost', name: 'Färskost', aliases: ['philadelphia'], caloriesPer100g: 230, proteinPer100g: 5, carbsPer100g: 4, fatPer100g: 21 },
  { slug: 'mjukost', name: 'Mjukost', caloriesPer100g: 260, proteinPer100g: 13, carbsPer100g: 3, fatPer100g: 22 },
  { slug: 'lattost-17', name: 'Lättost 17%', aliases: ['ost'], caloriesPer100g: 270, proteinPer100g: 30, carbsPer100g: 1, fatPer100g: 17 },
  { slug: 'riven-pizzaost', name: 'Riven pizzaost', aliases: ['ost'], caloriesPer100g: 330, proteinPer100g: 25, carbsPer100g: 1, fatPer100g: 25 },
  { slug: 'halloumi', name: 'Halloumi', caloriesPer100g: 320, proteinPer100g: 22, carbsPer100g: 2, fatPer100g: 25 },
  { slug: 'brie', name: 'Brie', caloriesPer100g: 330, proteinPer100g: 20, carbsPer100g: 0.5, fatPer100g: 28 },
  { slug: 'chevre-getost', name: 'Chèvre (getost)', aliases: ['getost'], caloriesPer100g: 300, proteinPer100g: 19, carbsPer100g: 1, fatPer100g: 25 },
  { slug: 'chokladmjolk', name: 'Chokladmjölk', aliases: ["o'boy", 'oboy'], caloriesPer100g: 75, proteinPer100g: 3.3, carbsPer100g: 10, fatPer100g: 2 },

  // Ris, pasta, potatis och bröd
  { slug: 'basmatiris-kokt', name: 'Basmatiris, kokt', aliases: ['ris'], caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3 },
  { slug: 'jasminris-kokt', name: 'Jasminris, kokt', aliases: ['ris'], caloriesPer100g: 130, proteinPer100g: 2.5, carbsPer100g: 29, fatPer100g: 0.2 },
  { slug: 'fullkornspasta-kokt', name: 'Fullkornspasta, kokt', aliases: ['pasta'], caloriesPer100g: 140, proteinPer100g: 5.5, carbsPer100g: 26, fatPer100g: 1.1 },
  { slug: 'aggnudlar-kokta', name: 'Äggnudlar, kokta', aliases: ['nudlar'], caloriesPer100g: 140, proteinPer100g: 5, carbsPer100g: 26, fatPer100g: 1.5 },
  { slug: 'risnudlar-kokta', name: 'Risnudlar, kokta', aliases: ['nudlar'], caloriesPer100g: 110, proteinPer100g: 1.8, carbsPer100g: 24.5, fatPer100g: 0.2 },
  { slug: 'snabbnudlar-tillagade', name: 'Snabbnudlar, tillagade', aliases: ['nudlar'], caloriesPer100g: 140, proteinPer100g: 3, carbsPer100g: 19, fatPer100g: 6 },
  { slug: 'potatismos', name: 'Potatismos', aliases: ['mos'], caloriesPer100g: 100, proteinPer100g: 2, carbsPer100g: 13, fatPer100g: 4.5 },
  { slug: 'ugnsrostad-potatis', name: 'Ugnsrostad potatis', aliases: ['potatis'], caloriesPer100g: 140, proteinPer100g: 2.5, carbsPer100g: 22, fatPer100g: 5 },
  { slug: 'klyftpotatis', name: 'Klyftpotatis', aliases: ['potatis'], caloriesPer100g: 150, proteinPer100g: 2.5, carbsPer100g: 23, fatPer100g: 5.5 },
  { slug: 'ugnspommes', name: 'Ugnspommes', aliases: ['pommes frites'], caloriesPer100g: 180, proteinPer100g: 3, carbsPer100g: 27, fatPer100g: 6.5 },
  { slug: 'polenta-kokt', name: 'Polenta, kokt', caloriesPer100g: 70, proteinPer100g: 1.6, carbsPer100g: 15, fatPer100g: 0.3 },
  { slug: 'mannagrynsgrot-med-mjolk', name: 'Mannagrynsgröt med mjölk', aliases: ['gröt'], caloriesPer100g: 90, proteinPer100g: 3.5, carbsPer100g: 13, fatPer100g: 2.5 },
  { slug: 'granola', name: 'Granola', caloriesPer100g: 450, proteinPer100g: 10, carbsPer100g: 60, fatPer100g: 18 },
  { slug: 'vetemjol', name: 'Vetemjöl', caloriesPer100g: 340, proteinPer100g: 10, carbsPer100g: 71, fatPer100g: 1.3 },
  { slug: 'pitabrod', name: 'Pitabröd', caloriesPer100g: 275, proteinPer100g: 9, carbsPer100g: 55, fatPer100g: 1.2, portionG: 60, portionUnit: 'st' },
  { slug: 'naanbrod', name: 'Naanbröd', caloriesPer100g: 290, proteinPer100g: 9, carbsPer100g: 50, fatPer100g: 6, portionG: 90, portionUnit: 'st' },
  { slug: 'bagel', name: 'Bagel', caloriesPer100g: 260, proteinPer100g: 10, carbsPer100g: 50, fatPer100g: 1.6, portionG: 90, portionUnit: 'st' },
  { slug: 'croissant', name: 'Croissant', caloriesPer100g: 400, proteinPer100g: 8, carbsPer100g: 45, fatPer100g: 21, portionG: 60, portionUnit: 'st' },
  { slug: 'rostbrod', name: 'Rostbröd', aliases: ['formfranska', 'toast'], caloriesPer100g: 260, proteinPer100g: 8, carbsPer100g: 48, fatPer100g: 3.5, portionG: 30, portionUnit: 'st' },
  { slug: 'baguette', name: 'Baguette', caloriesPer100g: 270, proteinPer100g: 9, carbsPer100g: 55, fatPer100g: 1.5 },
  { slug: 'tunnbrod-mjukt', name: 'Tunnbröd, mjukt', caloriesPer100g: 300, proteinPer100g: 8, carbsPer100g: 58, fatPer100g: 4 },
  { slug: 'scones', name: 'Scones', caloriesPer100g: 340, proteinPer100g: 7, carbsPer100g: 50, fatPer100g: 12, portionG: 60, portionUnit: 'st' },
  { slug: 'tacoskal', name: 'Tacoskal', caloriesPer100g: 480, proteinPer100g: 6, carbsPer100g: 62, fatPer100g: 22, portionG: 11, portionUnit: 'st' },

  // Fler frukter och bär
  { slug: 'clementin', name: 'Clementin', aliases: ['mandarin'], caloriesPer100g: 47, proteinPer100g: 0.8, carbsPer100g: 12, fatPer100g: 0.2, portionG: 70, portionUnit: 'st' },
  { slug: 'grapefrukt', name: 'Grapefrukt', caloriesPer100g: 42, proteinPer100g: 0.8, carbsPer100g: 10.7, fatPer100g: 0.1 },
  { slug: 'lingon', name: 'Lingon', caloriesPer100g: 50, proteinPer100g: 0.7, carbsPer100g: 11, fatPer100g: 0.6 },
  { slug: 'bjornbar', name: 'Björnbär', caloriesPer100g: 43, proteinPer100g: 1.4, carbsPer100g: 9.6, fatPer100g: 0.5 },
  { slug: 'svarta-vinbar', name: 'Svarta vinbär', aliases: ['vinbär'], caloriesPer100g: 63, proteinPer100g: 1.4, carbsPer100g: 15, fatPer100g: 0.4 },
  { slug: 'honungsmelon', name: 'Honungsmelon', aliases: ['melon'], caloriesPer100g: 36, proteinPer100g: 0.5, carbsPer100g: 9, fatPer100g: 0.1 },
  { slug: 'papaya', name: 'Papaya', caloriesPer100g: 43, proteinPer100g: 0.5, carbsPer100g: 11, fatPer100g: 0.3 },
  { slug: 'barblandning-fryst', name: 'Bärblandning, fryst', aliases: ['bär'], caloriesPer100g: 45, proteinPer100g: 1, carbsPer100g: 10, fatPer100g: 0.4 },
  { slug: 'apelsinjuice', name: 'Apelsinjuice', aliases: ['juice'], caloriesPer100g: 45, proteinPer100g: 0.7, carbsPer100g: 10.4, fatPer100g: 0.2 },
  { slug: 'appeljuice', name: 'Äppeljuice', aliases: ['juice'], caloriesPer100g: 46, proteinPer100g: 0.1, carbsPer100g: 11.3, fatPer100g: 0.1 },

  // Fler grönsaker och baljväxter
  { slug: 'grona-artor', name: 'Gröna ärtor', aliases: ['ärtor'], caloriesPer100g: 80, proteinPer100g: 5.4, carbsPer100g: 14, fatPer100g: 0.4 },
  { slug: 'haricots-verts-kokta', name: 'Haricots verts, kokta', aliases: ['bönor'], caloriesPer100g: 35, proteinPer100g: 1.9, carbsPer100g: 7, fatPer100g: 0.2 },
  { slug: 'gronkal', name: 'Grönkål', caloriesPer100g: 50, proteinPer100g: 4, carbsPer100g: 9, fatPer100g: 0.9 },
  { slug: 'ruccola', name: 'Ruccola', aliases: ['sallad'], caloriesPer100g: 25, proteinPer100g: 2.6, carbsPer100g: 3.7, fatPer100g: 0.7 },
  { slug: 'oliver-grona', name: 'Oliver, gröna', aliases: ['oliver'], caloriesPer100g: 145, proteinPer100g: 1, carbsPer100g: 4, fatPer100g: 15 },
  { slug: 'bonor-i-tomatsas', name: 'Bönor i tomatsås', aliases: ['baked beans'], caloriesPer100g: 80, proteinPer100g: 4.7, carbsPer100g: 13, fatPer100g: 0.4 },
  { slug: 'inlagd-gurka-attiksgurka', name: 'Inlagd gurka (ättiksgurka)', aliases: ['saltgurka'], caloriesPer100g: 55, proteinPer100g: 0.4, carbsPer100g: 13, fatPer100g: 0.1 },
  { slug: 'surkal', name: 'Surkål', caloriesPer100g: 20, proteinPer100g: 1, carbsPer100g: 4, fatPer100g: 0.1 },
  { slug: 'pumpa-ugnsbakad', name: 'Pumpa, ugnsbakad', caloriesPer100g: 26, proteinPer100g: 1, carbsPer100g: 6.5, fatPer100g: 0.1 },
  { slug: 'pak-choi', name: 'Pak choi', caloriesPer100g: 13, proteinPer100g: 1.5, carbsPer100g: 2.2, fatPer100g: 0.2 },
  { slug: 'wokgronsaker-frysta', name: 'Wokgrönsaker, frysta', aliases: ['grönsaksblandning'], caloriesPer100g: 40, proteinPer100g: 2, carbsPer100g: 7, fatPer100g: 0.3 },
  { slug: 'soltorkade-tomater-i-olja', name: 'Soltorkade tomater i olja', caloriesPer100g: 210, proteinPer100g: 5, carbsPer100g: 23, fatPer100g: 14 },

  // Fler nötter
  { slug: 'makadamianotter', name: 'Makadamianötter', caloriesPer100g: 718, proteinPer100g: 8, carbsPer100g: 14, fatPer100g: 76 },
  { slug: 'paranotter', name: 'Paranötter', caloriesPer100g: 660, proteinPer100g: 14, carbsPer100g: 12, fatPer100g: 67 },
  { slug: 'mandelsmor', name: 'Mandelsmör', caloriesPer100g: 615, proteinPer100g: 21, carbsPer100g: 19, fatPer100g: 55 },
  { slug: 'notmix', name: 'Nötmix', caloriesPer100g: 600, proteinPer100g: 18, carbsPer100g: 18, fatPer100g: 52 },
  { slug: 'studentgodis-notter-och-russin', name: 'Studentgodis (nötter och russin)', aliases: ['studentgodis'], caloriesPer100g: 480, proteinPer100g: 12, carbsPer100g: 45, fatPer100g: 30 },

  // Fler såser, sylt och sött
  { slug: 'pesto', name: 'Pesto', caloriesPer100g: 450, proteinPer100g: 5, carbsPer100g: 6, fatPer100g: 45 },
  { slug: 'bearnaisesas', name: 'Bearnaisesås', aliases: ['bearnaise'], caloriesPer100g: 550, proteinPer100g: 1, carbsPer100g: 3, fatPer100g: 60 },
  { slug: 'tzatziki', name: 'Tzatziki', caloriesPer100g: 110, proteinPer100g: 4, carbsPer100g: 4, fatPer100g: 8.5 },
  { slug: 'guacamole', name: 'Guacamole', caloriesPer100g: 155, proteinPer100g: 2, carbsPer100g: 8, fatPer100g: 13.5 },
  { slug: 'hummus', name: 'Hummus', caloriesPer100g: 240, proteinPer100g: 7, carbsPer100g: 14, fatPer100g: 17 },
  { slug: 'salsa-tacosas', name: 'Salsa (tacosås)', aliases: ['tacosås'], caloriesPer100g: 40, proteinPer100g: 1.5, carbsPer100g: 8, fatPer100g: 0.3 },
  { slug: 'sweet-chilisas', name: 'Sweet chilisås', aliases: ['sweet chili'], caloriesPer100g: 220, proteinPer100g: 0.3, carbsPer100g: 53, fatPer100g: 0.3 },
  { slug: 'sriracha', name: 'Sriracha', caloriesPer100g: 95, proteinPer100g: 2, carbsPer100g: 19, fatPer100g: 1 },
  { slug: 'aioli', name: 'Aioli', caloriesPer100g: 650, proteinPer100g: 1, carbsPer100g: 3, fatPer100g: 70 },
  { slug: 'vinagrett', name: 'Vinägrett', aliases: ['dressing'], caloriesPer100g: 400, proteinPer100g: 0, carbsPer100g: 8, fatPer100g: 41 },
  { slug: 'vitlokssas-kebabsas', name: 'Vitlökssås (kebabsås)', aliases: ['kebabsås'], caloriesPer100g: 280, proteinPer100g: 1.5, carbsPer100g: 6, fatPer100g: 27 },
  { slug: 'remouladsas', name: 'Remouladsås', caloriesPer100g: 480, proteinPer100g: 1, carbsPer100g: 8, fatPer100g: 49 },
  { slug: 'brunsas', name: 'Brunsås', aliases: ['sås'], caloriesPer100g: 80, proteinPer100g: 1.5, carbsPer100g: 7, fatPer100g: 5 },
  { slug: 'graddsas', name: 'Gräddsås', aliases: ['sås'], caloriesPer100g: 120, proteinPer100g: 1.5, carbsPer100g: 6, fatPer100g: 10 },
  { slug: 'lingonsylt', name: 'Lingonsylt', caloriesPer100g: 180, proteinPer100g: 0.3, carbsPer100g: 44, fatPer100g: 0.3 },
  { slug: 'jordgubbssylt', name: 'Jordgubbssylt', aliases: ['sylt'], caloriesPer100g: 200, proteinPer100g: 0.4, carbsPer100g: 49, fatPer100g: 0.2 },
  { slug: 'notkram-med-choklad-nutella', name: 'Nötkräm med choklad (Nutella)', aliases: ['nutella'], caloriesPer100g: 540, proteinPer100g: 6.3, carbsPer100g: 57, fatPer100g: 31 },
  { slug: 'socker', name: 'Socker', caloriesPer100g: 400, proteinPer100g: 0, carbsPer100g: 100, fatPer100g: 0 },
  { slug: 'ljus-sirap', name: 'Ljus sirap', aliases: ['sirap'], caloriesPer100g: 320, proteinPer100g: 0, carbsPer100g: 80, fatPer100g: 0 },

  // Fler drycker
  { slug: 'kaffe-svart', name: 'Kaffe, svart', aliases: ['kaffe'], caloriesPer100g: 2, proteinPer100g: 0.1, carbsPer100g: 0.3, fatPer100g: 0, portionG: 200 },
  { slug: 'kaffe-med-mjolk', name: 'Kaffe med mjölk', aliases: ['kaffe'], caloriesPer100g: 15, proteinPer100g: 0.8, carbsPer100g: 1.2, fatPer100g: 0.8, portionG: 200 },
  { slug: 'caffe-latte', name: 'Caffe latte', aliases: ['latte', 'kaffe'], caloriesPer100g: 52, proteinPer100g: 2.9, carbsPer100g: 4, fatPer100g: 2.8, portionG: 350 },
  { slug: 'cappuccino', name: 'Cappuccino', aliases: ['kaffe'], caloriesPer100g: 40, proteinPer100g: 2.2, carbsPer100g: 3, fatPer100g: 2, portionG: 250 },
  { slug: 'varm-choklad-med-mjolk', name: 'Varm choklad med mjölk', aliases: ['o boy', 'chokladdryck'], caloriesPer100g: 85, proteinPer100g: 3.5, carbsPer100g: 11, fatPer100g: 3, portionG: 250 },
  { slug: 'te-osotat', name: 'Te, osötat', aliases: ['te'], caloriesPer100g: 1, proteinPer100g: 0, carbsPer100g: 0.2, fatPer100g: 0, portionG: 250 },
  { slug: 'sportdryck', name: 'Sportdryck', caloriesPer100g: 25, proteinPer100g: 0, carbsPer100g: 6, fatPer100g: 0 },
  { slug: 'proteindryck-fardig', name: 'Proteindryck, färdig', aliases: ['proteinshake'], caloriesPer100g: 60, proteinPer100g: 8, carbsPer100g: 5, fatPer100g: 1 },
  { slug: 'kombucha', name: 'Kombucha', caloriesPer100g: 20, proteinPer100g: 0, carbsPer100g: 4.5, fatPer100g: 0 },
  { slug: 'cider', name: 'Cider', caloriesPer100g: 50, proteinPer100g: 0, carbsPer100g: 6, fatPer100g: 0 },
  { slug: 'sprit-vodka-whisky-gin', name: 'Sprit (vodka, whisky, gin)', aliases: ['sprit', 'vodka', 'whisky', 'gin'], caloriesPer100g: 230, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0, portionG: 40 },

  // Fler snacks och fika
  { slug: 'ostbagar', name: 'Ostbågar', caloriesPer100g: 520, proteinPer100g: 6, carbsPer100g: 58, fatPer100g: 29 },
  { slug: 'salta-pinnar', name: 'Salta pinnar', caloriesPer100g: 380, proteinPer100g: 10, carbsPer100g: 77, fatPer100g: 3 },
  { slug: 'tortillachips', name: 'Tortillachips', aliases: ['nachochips'], caloriesPer100g: 490, proteinPer100g: 7, carbsPer100g: 62, fatPer100g: 23 },
  { slug: 'vingummi-gelegodis', name: 'Vingummi/gelégodis', aliases: ['godis'], caloriesPer100g: 340, proteinPer100g: 6, carbsPer100g: 77, fatPer100g: 0.2 },
  { slug: 'kexchoklad', name: 'Kexchoklad', caloriesPer100g: 510, proteinPer100g: 6, carbsPer100g: 62, fatPer100g: 26 },
  { slug: 'riskaka-med-choklad', name: 'Riskaka med choklad', caloriesPer100g: 480, proteinPer100g: 7, carbsPer100g: 62, fatPer100g: 22 },
  { slug: 'ballerinakex', name: 'Ballerinakex', aliases: ['kex'], caloriesPer100g: 500, proteinPer100g: 6, carbsPer100g: 64, fatPer100g: 24 },
  { slug: 'pepparkakor', name: 'Pepparkakor', caloriesPer100g: 450, proteinPer100g: 6, carbsPer100g: 70, fatPer100g: 16, portionG: 8, portionUnit: 'st' },
  { slug: 'muffin', name: 'Muffin', caloriesPer100g: 400, proteinPer100g: 5.5, carbsPer100g: 50, fatPer100g: 20, portionG: 80, portionUnit: 'st' },
  { slug: 'wienerbrod', name: 'Wienerbröd', caloriesPer100g: 400, proteinPer100g: 6, carbsPer100g: 45, fatPer100g: 21, portionG: 80, portionUnit: 'st' },
  { slug: 'dammsugare-punschrulle', name: 'Dammsugare (punschrulle)', aliases: ['punschrulle'], caloriesPer100g: 430, proteinPer100g: 4, carbsPer100g: 55, fatPer100g: 21, portionG: 50, portionUnit: 'st' },
  { slug: 'mjukglass', name: 'Mjukglass', aliases: ['glass'], caloriesPer100g: 130, proteinPer100g: 3.5, carbsPer100g: 20, fatPer100g: 4 },
  { slug: 'glasspinne-med-chokladoverdrag', name: 'Glasspinne med chokladöverdrag', aliases: ['glass', 'magnum'], caloriesPer100g: 320, proteinPer100g: 4, carbsPer100g: 30, fatPer100g: 20, portionG: 80, portionUnit: 'st' },

  // Pizzor (pizzeria, hel pizza ca 450 g)
  { slug: 'pizza-margherita', name: 'Pizza Margherita', aliases: ['pizza'], caloriesPer100g: 240, proteinPer100g: 10, carbsPer100g: 30, fatPer100g: 8.5, portionG: 450 },
  { slug: 'pizza-vesuvio', name: 'Pizza Vesuvio', aliases: ['pizza'], caloriesPer100g: 245, proteinPer100g: 11.5, carbsPer100g: 29, fatPer100g: 9, portionG: 450 },
  { slug: 'pizza-capricciosa', name: 'Pizza Capricciosa', aliases: ['pizza'], caloriesPer100g: 240, proteinPer100g: 11, carbsPer100g: 28, fatPer100g: 9, portionG: 470 },
  { slug: 'pizza-hawaii', name: 'Pizza Hawaii', aliases: ['pizza'], caloriesPer100g: 240, proteinPer100g: 11, carbsPer100g: 30, fatPer100g: 8, portionG: 470 },
  { slug: 'kebabpizza', name: 'Kebabpizza', aliases: ['pizza'], caloriesPer100g: 270, proteinPer100g: 12, carbsPer100g: 28, fatPer100g: 12, portionG: 550 },
  { slug: 'pizza-quattro-stagioni', name: 'Pizza Quattro stagioni', aliases: ['pizza'], caloriesPer100g: 245, proteinPer100g: 11, carbsPer100g: 28, fatPer100g: 9.5, portionG: 480 },
  { slug: 'pizza-mexicana', name: 'Pizza Mexicana', aliases: ['pizza'], caloriesPer100g: 255, proteinPer100g: 12, carbsPer100g: 28, fatPer100g: 10.5, portionG: 480 },
  { slug: 'pizza-bolognese', name: 'Pizza Bolognese', aliases: ['pizza'], caloriesPer100g: 250, proteinPer100g: 11, carbsPer100g: 28, fatPer100g: 10, portionG: 480 },

  // Fler rätter och gatukök
  { slug: 'tunnbrodsrulle', name: 'Tunnbrödsrulle', caloriesPer100g: 230, proteinPer100g: 7, carbsPer100g: 26, fatPer100g: 11, portionG: 450, portionUnit: 'st' },
  { slug: 'korv-med-mos', name: 'Korv med mos', caloriesPer100g: 170, proteinPer100g: 5, carbsPer100g: 15, fatPer100g: 10, portionG: 350 },
  { slug: 'kottbullar-med-potatismos-och-lingon', name: 'Köttbullar med potatismos och lingon', caloriesPer100g: 160, proteinPer100g: 7, carbsPer100g: 14, fatPer100g: 8.5, portionG: 400 },
  { slug: 'tacopaj', name: 'Tacopaj', caloriesPer100g: 250, proteinPer100g: 11, carbsPer100g: 18, fatPer100g: 15, portionG: 250 },
  { slug: 'chili-sin-carne', name: 'Chili sin carne', caloriesPer100g: 95, proteinPer100g: 5, carbsPer100g: 12, fatPer100g: 2.5, portionG: 400 },
  { slug: 'shakshuka', name: 'Shakshuka', caloriesPer100g: 100, proteinPer100g: 6, carbsPer100g: 6, fatPer100g: 6, portionG: 350 },
  { slug: 'omelett', name: 'Omelett', caloriesPer100g: 155, proteinPer100g: 11, carbsPer100g: 1, fatPer100g: 12, portionG: 150 },
  { slug: 'nigiri-med-lax', name: 'Nigiri med lax', aliases: ['sushi'], caloriesPer100g: 160, proteinPer100g: 7, carbsPer100g: 25, fatPer100g: 3.5, portionG: 35, portionUnit: 'st' },
  { slug: 'maki-bit', name: 'Maki, bit', aliases: ['sushi'], caloriesPer100g: 150, proteinPer100g: 5, carbsPer100g: 27, fatPer100g: 2, portionG: 25, portionUnit: 'st' },
  { slug: 'falafel', name: 'Falafel', caloriesPer100g: 330, proteinPer100g: 13, carbsPer100g: 32, fatPer100g: 18, portionG: 20, portionUnit: 'st' },

  // Max — officiella värden från https://max.se/maten/naringsvarden/ (hämtade 2026-10-24),
  // omräknade från portion till per 100 g. portionG = kedjans portionsvikt.
  { slug: 'max-original', name: 'Original', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 221.8, proteinPer100g: 9.5, carbsPer100g: 14.8, fatPer100g: 13.7, portionG: 243, portionUnit: 'st' },
  { slug: 'max-frisco', name: 'Frisco', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 245.5, proteinPer100g: 11.8, carbsPer100g: 15.9, fatPer100g: 14.9, portionG: 235, portionUnit: 'st' },
  { slug: 'max-dubbel-friscoburgare', name: 'Dubbel Friscoburgare', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 250.2, proteinPer100g: 13.8, carbsPer100g: 12.3, fatPer100g: 16.2, portionG: 325, portionUnit: 'st' },
  { slug: 'max-grand-chili-cheese', name: 'Grand Chili Cheese', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 273.5, proteinPer100g: 10.5, carbsPer100g: 17.1, fatPer100g: 18, portionG: 362, portionUnit: 'st' },
  { slug: 'max-dubbel-original', name: 'Dubbel Original', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 240.4, proteinPer100g: 12.4, carbsPer100g: 12.7, fatPer100g: 15.5, portionG: 297, portionUnit: 'st' },
  { slug: 'max-max-burgare', name: 'MAX-burgare', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 252.9, proteinPer100g: 10.3, carbsPer100g: 15.6, fatPer100g: 16.4, portionG: 225, portionUnit: 'st' },
  { slug: 'max-hamburgare', name: 'Hamburgare', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 269.7, proteinPer100g: 10.9, carbsPer100g: 21.1, fatPer100g: 15.9, portionG: 102, portionUnit: 'st' },
  { slug: 'max-cheeseburgare', name: 'Cheeseburgare', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 276.6, proteinPer100g: 11.8, carbsPer100g: 19.1, fatPer100g: 17, portionG: 114.5, portionUnit: 'st' },
  { slug: 'max-dubbel-cheeseburgare', name: 'Dubbel Cheeseburgare', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 278.7, proteinPer100g: 14.9, carbsPer100g: 14.6, fatPer100g: 17.8, portionG: 158.6, portionUnit: 'st' },
  { slug: 'max-classic-68-cheese', name: "Classic '68 Cheese", brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 241.1, proteinPer100g: 13.3, carbsPer100g: 12.9, fatPer100g: 14.7, portionG: 292, portionUnit: 'st' },
  { slug: 'max-triple-cheese', name: 'Triple Cheese', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 277.8, proteinPer100g: 14.5, carbsPer100g: 12.2, fatPer100g: 18.6, portionG: 291.9, portionUnit: 'st' },
  { slug: 'max-grand-chili-cheese-crispy-chicken', name: 'Grand Chili Cheese Crispy Chicken', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 256.4, proteinPer100g: 8.8, carbsPer100g: 22.6, fatPer100g: 13.7, portionG: 328, portionUnit: 'st' },
  { slug: 'max-grand-chicken-sandwich', name: 'Grand Chicken Sandwich', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 241.8, proteinPer100g: 9.9, carbsPer100g: 22.2, fatPer100g: 12.1, portionG: 253.5, portionUnit: 'st' },
  { slug: 'max-grilled-chicken-sandwich', name: 'Grilled Chicken Sandwich', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 214.6, proteinPer100g: 10.9, carbsPer100g: 15.6, fatPer100g: 11.7, portionG: 232, portionUnit: 'st' },
  { slug: 'max-spicy-chicken', name: 'Spicy Chicken', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 216.3, proteinPer100g: 8.2, carbsPer100g: 18, fatPer100g: 12.3, portionG: 299, portionUnit: 'st' },
  { slug: 'max-chicken-jr', name: 'Chicken Jr.', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 236.1, proteinPer100g: 9.6, carbsPer100g: 23.5, fatPer100g: 11.4, portionG: 124.5, portionUnit: 'st' },
  { slug: 'max-chicken-nuggets-4-bitar', name: 'Chicken nuggets 4 bitar', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 236.2, proteinPer100g: 13.8, carbsPer100g: 18.2, fatPer100g: 11.9, portionG: 80, portionUnit: 'st' },
  { slug: 'max-chicken-nuggets-6-bitar', name: 'Chicken nuggets 6 bitar', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 235.8, proteinPer100g: 13.8, carbsPer100g: 18.3, fatPer100g: 11.9, portionG: 120, portionUnit: 'st' },
  { slug: 'max-chicken-nuggets-9-bitar', name: 'Chicken nuggets 9 bitar', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 236.1, proteinPer100g: 13.8, carbsPer100g: 18.3, fatPer100g: 11.9, portionG: 180, portionUnit: 'st' },
  { slug: 'max-chicken-tenders-3-st', name: 'Chicken Tenders 3 st', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 209.7, proteinPer100g: 12.7, carbsPer100g: 20, fatPer100g: 8.5, portionG: 165, portionUnit: 'st' },
  { slug: 'max-chicken-tenders-5-st', name: 'Chicken Tenders 5 st', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 209.8, proteinPer100g: 12.7, carbsPer100g: 20, fatPer100g: 8.7, portionG: 275, portionUnit: 'st' },
  { slug: 'max-buffalo-hot-wings-5-pack-med-2-dippar', name: 'Buffalo Hot Wings 5-pack med 2 dippar', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 289.4, proteinPer100g: 14.7, carbsPer100g: 7.2, fatPer100g: 22.7, portionG: 298.5, portionUnit: 'st' },
  { slug: 'max-plant-beef-burger', name: 'Plant Beef burger', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 241.6, proteinPer100g: 9.8, carbsPer100g: 17.3, fatPer100g: 14.7, portionG: 252.5, portionUnit: 'st' },
  { slug: 'max-impossible-burger', name: 'Impossible Burger', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 194.7, proteinPer100g: 8.7, carbsPer100g: 14.3, fatPer100g: 11, portionG: 281, portionUnit: 'st' },
  { slug: 'max-grand-chili-cheese-impossible', name: 'Grand Chili Cheese Impossible', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 256.1, proteinPer100g: 9.6, carbsPer100g: 20.2, fatPer100g: 14.4, portionG: 312, portionUnit: 'st' },
  { slug: 'max-dubbel-original-plant-beef', name: 'Dubbel Original Plant Beef', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 261.2, proteinPer100g: 12.2, carbsPer100g: 12.7, fatPer100g: 17.7, portionG: 365, portionUnit: 'st' },
  { slug: 'max-unicorn-burger', name: 'Unicorn Burger', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 228.5, proteinPer100g: 10.1, carbsPer100g: 16.4, fatPer100g: 13.2, portionG: 262, portionUnit: 'st' },
  { slug: 'max-mung-bean-burger', name: 'Mung Bean Burger', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 222.8, proteinPer100g: 6.9, carbsPer100g: 23.7, fatPer100g: 10.1, portionG: 262.2, portionUnit: 'st' },
  { slug: 'max-veggieburger', name: 'Veggieburger', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 284.9, proteinPer100g: 12.5, carbsPer100g: 16.4, fatPer100g: 19.1, portionG: 152, portionUnit: 'st' },
  { slug: 'max-maxoumi', name: 'Maxoumi', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 283.8, proteinPer100g: 9.5, carbsPer100g: 17.6, fatPer100g: 19.3, portionG: 210, portionUnit: 'st' },
  { slug: 'max-dubbel-maxoumi', name: 'Dubbel Maxoumi', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 309.6, proteinPer100g: 12.6, carbsPer100g: 14, fatPer100g: 22.6, portionG: 270, portionUnit: 'st' },
  { slug: 'max-crispy-fries-liten', name: 'Crispy fries, liten', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 313.1, proteinPer100g: 3.5, carbsPer100g: 46.2, fatPer100g: 12.5, portionG: 55, portionUnit: 'st' },
  { slug: 'max-crispy-fries-mellan', name: 'Crispy fries, mellan', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 313, proteinPer100g: 3.5, carbsPer100g: 46.1, fatPer100g: 12.6, portionG: 115, portionUnit: 'st' },
  { slug: 'max-crispy-fries-stor', name: 'Crispy fries, stor', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 313, proteinPer100g: 3.5, carbsPer100g: 46.1, fatPer100g: 12.6, portionG: 165, portionUnit: 'st' },
  { slug: 'max-cheese-fries-stor', name: 'Cheese fries, stor', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 277, proteinPer100g: 2.3, carbsPer100g: 31.6, fatPer100g: 15.3, portionG: 260, portionUnit: 'st' },
  { slug: 'max-potato-bites-medium', name: 'Potato Bites, medium', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 186.7, proteinPer100g: 2.5, carbsPer100g: 22, fatPer100g: 8.7, portionG: 150, portionUnit: 'st' },
  { slug: 'max-potato-bites-stor', name: 'Potato Bites, stor', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 186.8, proteinPer100g: 2.5, carbsPer100g: 21.8, fatPer100g: 9.1, portionG: 220, portionUnit: 'st' },
  { slug: 'max-chili-cheese-liten-4-st', name: 'Chili cheese, liten 4 st', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 272, proteinPer100g: 9, carbsPer100g: 22, fatPer100g: 16, portionG: 80, portionUnit: 'st' },
  { slug: 'max-chili-cheese-stor-6-st', name: 'Chili cheese, stor 6 st', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 263.2, proteinPer100g: 8.7, carbsPer100g: 21.3, fatPer100g: 15.5, portionG: 124, portionUnit: 'st' },
  { slug: 'max-chicken-wings-liten-3-st', name: 'Chicken wings, liten 3 st', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 274.8, proteinPer100g: 20.7, carbsPer100g: 8.2, fatPer100g: 17.7, portionG: 123, portionUnit: 'st' },
  { slug: 'max-chicken-wings-mellan-5-st', name: 'Chicken wings, mellan 5 st', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 274.6, proteinPer100g: 20.7, carbsPer100g: 8.2, fatPer100g: 17.7, portionG: 205, portionUnit: 'st' },
  { slug: 'max-chicken-wings-stor-10-st', name: 'Chicken wings, stor 10 st', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 270, proteinPer100g: 20.4, carbsPer100g: 8.1, fatPer100g: 17.4, portionG: 417, portionUnit: 'st' },
  { slug: 'max-love-me-tender-sauce', name: 'Love Me Tender Sauce', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 500, proteinPer100g: 1, carbsPer100g: 22, fatPer100g: 44, portionG: 50, portionUnit: 'st' },
  { slug: 'max-love-me-tender-sauce-xl', name: 'Love Me Tender Sauce XL', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 500, proteinPer100g: 1, carbsPer100g: 23.1, fatPer100g: 44.6, portionG: 130, portionUnit: 'st' },
  { slug: 'max-raising-maxs-sauce', name: "Raising MAX's Sauce", brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 460, proteinPer100g: 1, carbsPer100g: 8.8, fatPer100g: 48, portionG: 50, portionUnit: 'st' },
  { slug: 'max-raising-maxs-sauce-xl', name: "Raising MAX's Sauce XL", brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 460, proteinPer100g: 1.1, carbsPer100g: 9.2, fatPer100g: 47.7, portionG: 130, portionUnit: 'st' },
  { slug: 'max-smalt-cheddardip', name: 'Smält cheddardip', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 140, proteinPer100g: 2, carbsPer100g: 8, fatPer100g: 11, portionG: 30, portionUnit: 'st' },
  { slug: 'max-smalt-cheddardip-xl', name: 'Smält cheddardip XL', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 140, proteinPer100g: 2, carbsPer100g: 8, fatPer100g: 11, portionG: 130, portionUnit: 'st' },
  { slug: 'max-lyxshake-choklad', name: 'Lyxshake Choklad', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 205.3, proteinPer100g: 3.2, carbsPer100g: 23.5, fatPer100g: 10.9, portionG: 379, portionUnit: 'st' },
  { slug: 'max-lyxshake-vanilj', name: 'Lyxshake Vanilj', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 146.6, proteinPer100g: 3.6, carbsPer100g: 19.5, fatPer100g: 6.1, portionG: 325, portionUnit: 'st' },
  { slug: 'max-lyxshake-jordgubb', name: 'Lyxshake Jordgubb', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 133.6, proteinPer100g: 2.7, carbsPer100g: 19, fatPer100g: 5.2, portionG: 375, portionUnit: 'st' },
  { slug: 'max-lyxshake-espresso-caramel', name: 'Lyxshake Espresso caramel', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 145.5, proteinPer100g: 3, carbsPer100g: 20.5, fatPer100g: 5.8, portionG: 369, portionUnit: 'st' },
  { slug: 'max-dubai-style-chocolate-shake', name: 'Dubai Style Chocolate shake', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 215, proteinPer100g: 4, carbsPer100g: 23.4, fatPer100g: 12.3, portionG: 391, portionUnit: 'st' },
  { slug: 'max-sundae-naturell', name: 'Sundae Naturell', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 163.2, proteinPer100g: 3.2, carbsPer100g: 24, fatPer100g: 6, portionG: 125, portionUnit: 'st' },
  { slug: 'max-sundae-kola', name: 'Sundae Kola', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 201.8, proteinPer100g: 3.2, carbsPer100g: 34.5, fatPer100g: 5.8, portionG: 164, portionUnit: 'st' },
  { slug: 'max-sundae-choklad', name: 'Sundae Choklad', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 195.1, proteinPer100g: 2.9, carbsPer100g: 35.2, fatPer100g: 4.8, portionG: 164, portionUnit: 'st' },
  { slug: 'max-sundae-jordgubb', name: 'Sundae Jordgubb', brand: 'Max', aliases: ['max burgers'], caloriesPer100g: 176, proteinPer100g: 2.6, carbsPer100g: 31, fatPer100g: 4.7, portionG: 162.5, portionUnit: 'st' },
]
