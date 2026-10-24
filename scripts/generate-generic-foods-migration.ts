// Genererar en migration som upsertar hela src/data/genericFoods.ts till
// public.food_items (source 'generic'). Kör: npm run foods:migration
//
// Upserten är idempotent och skriver över namn/varumärke/näringsvärden, så
// datafilen är alltid facit — även för rader som lagts in av äldre migrationer.
import { readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { GENERIC_FOODS } from '../src/data/genericFoods.ts'

const MIGRATIONS_DIR = join(import.meta.dirname, '..', 'supabase', 'migrations')

const errors: string[] = []
const warnings: string[] = []
const seen = new Set<string>()

for (const food of GENERIC_FOODS) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(food.slug)) errors.push(`${food.slug}: ogiltig slug`)
  if (seen.has(food.slug)) errors.push(`${food.slug}: dubblett`)
  seen.add(food.slug)

  const macros = [food.caloriesPer100g, food.proteinPer100g, food.carbsPer100g, food.fatPer100g]
  if (macros.some((value) => !Number.isFinite(value) || value < 0)) errors.push(`${food.slug}: ogiltigt näringsvärde`)
  if (food.proteinPer100g + food.carbsPer100g + food.fatPer100g > 100.5) errors.push(`${food.slug}: makron > 100 g per 100 g`)

  // Atwater-kontroll fångar skrivfel (t.ex. bortglömd decimal). Alkohol (7 kcal/g)
  // och fibrer ger naturliga avvikelser, därför bara en varning.
  const atwater = 4 * food.proteinPer100g + 4 * food.carbsPer100g + 9 * food.fatPer100g
  if (Math.abs(atwater - food.caloriesPer100g) > Math.max(25, food.caloriesPer100g * 0.2)) {
    warnings.push(`${food.slug}: ${food.caloriesPer100g} kcal men makron ger ${Math.round(atwater)}`)
  }
}

for (const warning of warnings) console.warn(`varning: ${warning}`)
if (errors.length > 0) {
  for (const error of errors) console.error(`fel: ${error}`)
  process.exit(1)
}

function sqlString(value: string | undefined): string {
  return value === undefined ? 'null' : `'${value.replaceAll("'", "''")}'`
}

function sqlNumber(value: number): string {
  return String(Math.round(value * 10) / 10)
}

const rows = GENERIC_FOODS.map(
  (food) =>
    `  ('generic', ${sqlString(food.slug)}, ${sqlString(food.name)}, ${sqlString(food.brand)}, ` +
    `${sqlNumber(food.caloriesPer100g)}, ${sqlNumber(food.proteinPer100g)}, ${sqlNumber(food.carbsPer100g)}, ${sqlNumber(food.fatPer100g)}, null)`,
)

const sql = `-- GENERERAD av scripts/generate-generic-foods-migration.ts — redigera inte för hand.
-- Källa: src/data/genericFoods.ts (${GENERIC_FOODS.length} livsmedel).
insert into public.food_items
  (source, external_id, name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, created_by)
values
${rows.join(',\n')}
on conflict (source, external_id) do update set
  name = excluded.name,
  brand = excluded.brand,
  calories_per_100g = excluded.calories_per_100g,
  protein_per_100g = excluded.protein_per_100g,
  carbs_per_100g = excluded.carbs_per_100g,
  fat_per_100g = excluded.fat_per_100g;
`

const lastNumber = Math.max(
  ...readdirSync(MIGRATIONS_DIR)
    .map((name) => Number(name.match(/^(\d{4})_/)?.[1]))
    .filter(Number.isFinite),
)
const fileName = `${String(lastNumber + 1).padStart(4, '0')}_sync_generic_foods.sql`
writeFileSync(join(MIGRATIONS_DIR, fileName), sql)
console.log(`Skrev supabase/migrations/${fileName} (${GENERIC_FOODS.length} livsmedel)`)
