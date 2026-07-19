-- Adds common Swedish home-cooked dishes to the 'generic' food source (portion
-- sizes live only in src/lib/genericFoods.ts, not the DB — meal_logs always
-- stores grams). Kept in sync by hand with that file.
insert into public.food_items
  (source, external_id, name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, created_by)
values
  ('generic', 'pyttipanna', 'Pyttipanna med ägg', null, 180, 6, 15, 10, null),
  ('generic', 'artsoppa', 'Ärtsoppa med fläsk', null, 75, 5, 8, 2.5, null),
  ('generic', 'kalops', 'Kalops med potatis', null, 140, 9, 12, 6, null),
  ('generic', 'janssons', 'Janssons frestelse', null, 180, 4, 14, 12, null),
  ('generic', 'raggmunk', 'Raggmunk med fläsk', null, 230, 7, 20, 14, null),
  ('generic', 'lasagne', 'Lasagne', null, 150, 8, 13, 8, null),
  ('generic', 'tacos', 'Tacos', null, 180, 8, 16, 9, null),
  ('generic', 'korv-stroganoff', 'Korv stroganoff med ris', null, 165, 6, 18, 8, null),
  ('generic', 'fiskgratang', 'Fiskgratäng', null, 150, 12, 6, 9, null),
  ('generic', 'kycklinggryta', 'Kycklinggryta med ris', null, 140, 10, 15, 5, null),
  ('generic', 'wienerschnitzel', 'Wienerschnitzel med potatis', null, 200, 12, 15, 11, null),
  ('generic', 'biff-lok', 'Biff med lök och potatismos', null, 190, 13, 10, 11, null),
  ('generic', 'kebabtallrik', 'Kebabtallrik', null, 170, 9, 15, 9, null),
  ('generic', 'sushi', 'Sushi, blandad', null, 150, 6, 25, 3, null),
  ('generic', 'korv-brod', 'Korv med bröd', null, 230, 9, 20, 13, null),
  ('generic', 'kladdkaka', 'Kladdkaka', null, 400, 5, 45, 22, null),
  ('generic', 'flaskpannkaka', 'Fläskpannkaka', null, 230, 9, 20, 13, null),
  ('generic', 'kramig-kycklingpasta', 'Krämig kycklingpasta', null, 180, 9, 16, 9, null)
on conflict (source, external_id) do nothing;
