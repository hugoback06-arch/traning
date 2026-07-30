-- Adds ~70 more common foods/dishes to the 'generic' food source: Swedish
-- classics, plant-based alternatives, more vegetables/fruit/fish, bread,
-- drinks, cooking staples, and more international dishes.
-- Kept in sync by hand with src/lib/genericFoods.ts.
insert into public.food_items
  (source, external_id, name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, created_by)
values
  -- Fler ikoniska svenska rätter
  ('generic', 'pannbiff-lok', 'Pannbiff med lök och gräddsås', null, 220, 14, 8, 15, null),
  ('generic', 'flygande-jacob', 'Flygande Jacob', null, 280, 15, 8, 21, null),
  ('generic', 'leverpastejmacka', 'Leverpastejmacka', null, 260, 9, 20, 16, null),
  ('generic', 'jagarschnitzel', 'Jägarschnitzel med svampsås', null, 210, 13, 10, 13, null),
  ('generic', 'kokt-flasklagg-rotmos', 'Kokt fläsklägg med rotmos', null, 220, 14, 10, 14, null),
  ('generic', 'fransk-loksoppa', 'Fransk löksoppa', null, 70, 3, 7, 3, null),
  ('generic', 'biff-lindstrom', 'Biff Lindström', null, 230, 13, 10, 15, null),

  -- Växtbaserade alternativ
  ('generic', 'havremjolk', 'Havremjölk', null, 47, 1, 7.5, 1.5, null),
  ('generic', 'mandelmjolk', 'Mandelmjölk, osötad', null, 13, 0.5, 0.3, 1.1, null),
  ('generic', 'sojamjolk', 'Sojamjölk', null, 33, 3.3, 0.5, 1.8, null),
  ('generic', 'vegofars', 'Vegofärs', null, 170, 18, 7, 7, null),
  ('generic', 'vegokorv', 'Vegokorv', null, 180, 15, 10, 9, null),
  ('generic', 'seitan', 'Seitan, tillagad', null, 120, 21, 4, 1.9, null),

  -- Fler grönsaker
  ('generic', 'vitlok', 'Vitlök', null, 149, 6.4, 33, 0.5, null),
  ('generic', 'ingefara', 'Ingefära', null, 80, 1.8, 18, 0.8, null),
  ('generic', 'chili', 'Chili', null, 40, 1.9, 9, 0.4, null),
  ('generic', 'rodlok', 'Rödlök', null, 40, 1.1, 9.3, 0.1, null),
  ('generic', 'sockerartor', 'Sockerärtor', null, 42, 2.8, 7.5, 0.2, null),
  ('generic', 'kronartskocka', 'Kronärtskocka', null, 47, 3.3, 10.5, 0.2, null),
  ('generic', 'fankal', 'Fänkål', null, 31, 1.2, 7.3, 0.2, null),

  -- Fler frukter
  ('generic', 'citron', 'Citron', null, 29, 1.1, 9.3, 0.3, null),
  ('generic', 'lime', 'Lime', null, 30, 0.7, 10.5, 0.2, null),
  ('generic', 'nektarin', 'Nektarin', null, 44, 1.1, 10.5, 0.3, null),
  ('generic', 'passionsfrukt', 'Passionsfrukt', null, 97, 2.2, 23, 0.4, null),
  ('generic', 'aprikos-torkad', 'Aprikoser, torkade', null, 241, 3.4, 63, 0.5, null),

  -- Fler fisk/skaldjur
  ('generic', 'rokt-lax', 'Rökt lax', null, 117, 18, 0, 4.3, null),
  ('generic', 'makrill', 'Makrill', null, 205, 19, 0, 14, null),
  ('generic', 'sej', 'Sej, tillagad', null, 105, 23, 0, 1, null),
  ('generic', 'kolja', 'Kolja, tillagad', null, 90, 20, 0, 0.7, null),
  ('generic', 'tilapia', 'Tilapia, tillagad', null, 128, 26, 0, 3, null),

  -- Bröd
  ('generic', 'ragbrod', 'Rågbröd', null, 259, 8, 48, 2, null),
  ('generic', 'surdegsbrod', 'Surdegsbröd', null, 260, 9, 50, 1.5, null),
  ('generic', 'hamburgerbrod', 'Hamburgerbröd', null, 280, 9, 50, 5, null),

  -- Drycker
  ('generic', 'ol-folkol', 'Öl, folköl', null, 40, 0.4, 3.5, 0, null),
  ('generic', 'ol-starkol', 'Öl, starköl/lager', null, 43, 0.4, 3.5, 0, null),
  ('generic', 'vin-rott', 'Vin, rött', null, 85, 0.1, 2.6, 0, null),
  ('generic', 'vin-vitt', 'Vin, vitt', null, 82, 0.1, 2.6, 0, null),
  ('generic', 'lask-cola', 'Läsk/cola', null, 42, 0, 10.6, 0, null),
  ('generic', 'lask-light', 'Lightläsk', null, 1, 0, 0, 0, null),
  ('generic', 'energidryck', 'Energidryck', null, 45, 0, 11, 0, null),

  -- Matlagningsbas
  ('generic', 'kokosmjolk', 'Kokosmjölk', null, 197, 2.3, 2.8, 21, null),
  ('generic', 'buljong', 'Buljong, färdig', null, 5, 0.5, 0.5, 0.2, null),
  ('generic', 'krossade-tomater', 'Krossade tomater, konserv', null, 24, 1.2, 4.5, 0.2, null),
  ('generic', 'tomatpure', 'Tomatpuré', null, 82, 4.3, 17, 0.5, null),

  -- Fler kötträtter
  ('generic', 'korvgryta', 'Korvgryta med potatis', null, 160, 7, 14, 8, null),
  ('generic', 'kalvfile-stroganoff', 'Kalvfilé stroganoff med ris', null, 190, 13, 15, 9, null),
  ('generic', 'lammgryta', 'Lammgryta med rotfrukter', null, 160, 12, 10, 8, null),
  ('generic', 'lammkotletter', 'Lammkotletter, tillagade', null, 294, 25, 0, 21, null),
  ('generic', 'entrecote', 'Entrecote, tillagad', null, 250, 26, 0, 16, null),
  ('generic', 'flaskkarre', 'Fläskkarré, tillagad', null, 210, 27, 0, 11, null),

  -- Frukost
  ('generic', 'fiberflingor', 'Fiberrika frukostflingor', null, 350, 10, 68, 3, null),
  ('generic', 'fralla', 'Frukostfralla', null, 270, 9, 48, 4.5, null),

  -- Fler nötter/frön
  ('generic', 'jordnotter-rostade', 'Jordnötter, rostade', null, 567, 25, 16, 49, null),
  ('generic', 'pinjenotter', 'Pinjenötter', null, 673, 14, 13, 68, null),
  ('generic', 'sesamfron', 'Sesamfrön', null, 573, 18, 23, 50, null),
  ('generic', 'linfron', 'Linfrön', null, 534, 18, 29, 42, null),

  -- Fler internationella rätter
  ('generic', 'enchiladas', 'Enchiladas med kött', null, 190, 10, 18, 9, null),
  ('generic', 'fajitas-kyckling', 'Fajitas med kyckling', null, 170, 12, 15, 7, null),
  ('generic', 'caesarwrap', 'Caesarwrap', null, 220, 11, 20, 10, null),
  ('generic', 'laksa', 'Laksa', null, 130, 7, 12, 6, null),
  ('generic', 'anka-hoisin', 'Anka i hoisinsås med ris', null, 210, 10, 20, 9, null),
  ('generic', 'ceviche', 'Ceviche', null, 100, 15, 5, 2, null),
  ('generic', 'empanadas', 'Empanadas', null, 260, 8, 26, 13, null),

  -- Fler efterrätter
  ('generic', 'creme-brulee', 'Crème brûlée', null, 300, 4, 25, 20, null),
  ('generic', 'macarons', 'Macarons', null, 400, 6, 55, 18, null),
  ('generic', 'brownie', 'Brownie', null, 430, 5, 50, 23, null),

  -- Specialkost
  ('generic', 'glutenfritt-brod', 'Glutenfritt bröd', null, 240, 4, 45, 3, null),
  ('generic', 'laktosfri-mjolk', 'Laktosfri mjölk', null, 46, 3.4, 4.9, 1.5, null);
