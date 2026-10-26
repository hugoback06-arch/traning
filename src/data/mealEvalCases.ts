// Test set for /admin/ai-eval. Each case's expected nutrition is computed from
// src/data/genericFoods.ts (slug × grams), so the descriptions use explicit or
// unambiguous quantities — otherwise there's no fair "right answer" to score
// the text estimator against.
export interface MealEvalCase {
  description: string
  components: { slug: string; grams: number }[]
}

export const MEAL_EVAL_CASES: MealEvalCase[] = [
  { description: '2 kokta ägg', components: [{ slug: 'agg', grams: 120 }] },
  { description: '2 skivor rostbröd med 10 g smör', components: [{ slug: 'rostbrod', grams: 60 }, { slug: 'smor', grams: 10 }] },
  { description: 'Ett äpple och en banan', components: [{ slug: 'apple', grams: 150 }, { slug: 'banan', grams: 120 }] },
  { description: '3 dl mjölk', components: [{ slug: 'mjolk-standard', grams: 300 }] },
  { description: '200 g keso', components: [{ slug: 'keso', grams: 200 }] },
  { description: '200 g kvarg med 100 g blåbär', components: [{ slug: 'kvarg-naturell', grams: 200 }, { slug: 'blabar', grams: 100 }] },
  {
    description: '150 g kycklingbröst, 200 g kokt ris och 100 g broccoli',
    components: [
      { slug: 'kycklingbrost', grams: 150 },
      { slug: 'ris-kokt', grams: 200 },
      { slug: 'broccoli-kokt', grams: 100 },
    ],
  },
  {
    description: '150 g lax med 200 g kokt potatis',
    components: [
      { slug: 'lax', grams: 150 },
      { slug: 'potatis-kokt', grams: 200 },
    ],
  },
  {
    description: '180 g kokt pasta med 120 g stekt nötfärs',
    components: [
      { slug: 'pasta-kokt', grams: 180 },
      { slug: 'notfars', grams: 120 },
    ],
  },
  {
    description: '2 knäckebröd med 10 g smör och 2 skivor hushållsost',
    components: [
      { slug: 'knackebrod', grams: 24 },
      { slug: 'smor', grams: 10 },
      { slug: 'ost-hushall', grams: 20 },
    ],
  },
  {
    description: 'Äggröra på 3 ägg stekt i 5 g smör',
    components: [
      { slug: 'agg', grams: 180 },
      { slug: 'smor', grams: 5 },
    ],
  },
  { description: 'En kanelbulle', components: [{ slug: 'kanelbulle', grams: 65 }] },
  { description: 'En portion lasagne', components: [{ slug: 'lasagne', grams: 350 }] },
  { description: 'En tallrik spaghetti bolognese', components: [{ slug: 'spaghetti-bolognese', grams: 400 }] },
  {
    description: 'En Big Mac och mellan pommes på McDonalds',
    components: [
      { slug: 'mcdonald-s-big-mac', grams: 215 },
      { slug: 'mcdonald-s-pommes-frites-mellan', grams: 114 },
    ],
  },
  { description: 'En Whopper från Burger King', components: [{ slug: 'burger-king-whopper', grams: 270 }] },
  { description: 'Original från Max', components: [{ slug: 'max-original', grams: 243 }] },
]
