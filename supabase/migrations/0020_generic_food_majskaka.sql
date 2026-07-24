-- Adds "Majskaka" as a generic food, matching src/lib/genericFoods.ts.
insert into public.food_items
  (source, external_id, name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, created_by)
values
  ('generic', 'majskaka', 'Majskaka', null, 383, 7.5, 80, 3, null);
