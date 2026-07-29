-- Adds ~100 common everyday foods/dishes to the 'generic' food source.
-- Kept in sync by hand with src/lib/genericFoods.ts.
insert into public.food_items
  (source, external_id, name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, created_by)
values
  -- Frukt
  ('generic', 'mango', 'Mango', null, 60, 0.8, 15, 0.4, null),
  ('generic', 'kiwi', 'Kiwi', null, 61, 1.1, 14.7, 0.5, null),
  ('generic', 'druvor', 'Druvor', null, 69, 0.7, 18, 0.2, null),
  ('generic', 'paron', 'Päron', null, 57, 0.4, 15, 0.1, null),
  ('generic', 'blabar', 'Blåbär', null, 57, 0.7, 14, 0.3, null),
  ('generic', 'hallon', 'Hallon', null, 52, 1.2, 12, 0.7, null),
  ('generic', 'vattenmelon', 'Vattenmelon', null, 30, 0.6, 8, 0.2, null),
  ('generic', 'ananas', 'Ananas', null, 50, 0.5, 13, 0.1, null),
  ('generic', 'persika', 'Persika', null, 39, 0.9, 10, 0.3, null),
  ('generic', 'plommon', 'Plommon', null, 46, 0.7, 11, 0.3, null),
  ('generic', 'korsbar', 'Körsbär', null, 63, 1.1, 16, 0.2, null),
  ('generic', 'granatapple', 'Granatäpple, kärnor', null, 83, 1.7, 19, 1.2, null),
  ('generic', 'fikon', 'Fikon, färska', null, 74, 0.8, 19, 0.3, null),
  ('generic', 'russin', 'Russin', null, 299, 3.1, 79, 0.5, null),
  ('generic', 'dadlar', 'Dadlar', null, 282, 2.5, 75, 0.4, null),

  -- Grönsaker
  ('generic', 'lok', 'Lök', null, 40, 1.1, 9.3, 0.1, null),
  ('generic', 'paprika', 'Paprika', null, 31, 1, 6, 0.3, null),
  ('generic', 'sallad-isberg', 'Sallad, isberg', null, 14, 0.9, 3, 0.1, null),
  ('generic', 'blomkal-kokt', 'Blomkål, kokt', null, 25, 1.9, 5, 0.3, null),
  ('generic', 'mais', 'Majs', null, 86, 3.3, 19, 1.4, null),
  ('generic', 'spenat', 'Spenat', null, 23, 2.9, 3.6, 0.4, null),
  ('generic', 'zucchini', 'Zucchini', null, 17, 1.2, 3.1, 0.3, null),
  ('generic', 'aubergine-kokt', 'Aubergine, kokt', null, 25, 1, 6, 0.2, null),
  ('generic', 'rodkal', 'Rödkål', null, 31, 1.4, 7.4, 0.2, null),
  ('generic', 'vitkal', 'Vitkål', null, 25, 1.3, 5.8, 0.1, null),
  ('generic', 'purjolok', 'Purjolök', null, 61, 1.5, 14, 0.3, null),
  ('generic', 'rodbetor-kokta', 'Rödbetor, kokta', null, 44, 1.6, 10, 0.2, null),
  ('generic', 'sotpotatis-kokt', 'Sötpotatis, kokt', null, 90, 2, 21, 0.1, null),
  ('generic', 'champinjoner', 'Champinjoner', null, 22, 3.1, 3.3, 0.3, null),
  ('generic', 'sparris-kokt', 'Sparris, kokt', null, 22, 2.4, 4.1, 0.2, null),
  ('generic', 'selleri', 'Selleri', null, 16, 0.7, 3, 0.2, null),
  ('generic', 'radisor', 'Rädisor', null, 16, 0.7, 3.4, 0.1, null),
  ('generic', 'brysselkal-kokt', 'Brysselkål, kokt', null, 43, 3.4, 7, 0.4, null),

  -- Mejeri
  ('generic', 'kvarg-naturell', 'Kvarg, naturell', null, 60, 12, 3.8, 0.2, null),
  ('generic', 'gradde-vispgradde', 'Vispgrädde', null, 340, 2.1, 3, 36, null),
  ('generic', 'cremefraiche', 'Crème fraîche', null, 300, 2.4, 3.9, 30, null),
  ('generic', 'mozzarella', 'Mozzarella', null, 280, 22, 2.2, 21, null),
  ('generic', 'parmesan', 'Parmesan', null, 392, 35, 3.2, 26, null),
  ('generic', 'feta', 'Feta', null, 264, 14, 4, 21, null),
  ('generic', 'cheddar', 'Cheddar', null, 402, 25, 1.3, 33, null),
  ('generic', 'skyr', 'Skyr', null, 63, 11, 4, 0.2, null),
  ('generic', 'aggvita', 'Äggvita', null, 52, 11, 0.7, 0.2, null),

  -- Nötter/frön
  ('generic', 'cashewnotter', 'Cashewnötter', null, 553, 18, 30, 44, null),
  ('generic', 'valnotter', 'Valnötter', null, 654, 15, 14, 65, null),
  ('generic', 'hasselnotter', 'Hasselnötter', null, 628, 15, 17, 61, null),
  ('generic', 'pistagenotter', 'Pistagenötter', null, 560, 20, 28, 45, null),
  ('generic', 'solrosfron', 'Solrosfrön', null, 584, 21, 20, 51, null),
  ('generic', 'chiafron', 'Chiafrön', null, 486, 17, 42, 31, null),
  ('generic', 'pumpafron', 'Pumpafrön', null, 559, 30, 11, 49, null),

  -- Kolhydrater/gryn
  ('generic', 'quinoa-kokt', 'Quinoa, kokt', null, 120, 4.4, 21, 1.9, null),
  ('generic', 'couscous-kokt', 'Couscous, kokt', null, 112, 3.8, 23, 0.2, null),
  ('generic', 'bulgur-kokt', 'Bulgur, kokt', null, 83, 3.1, 19, 0.2, null),
  ('generic', 'ris-fullkorn-kokt', 'Ris, fullkorn, kokt', null, 111, 2.6, 23, 0.9, null),
  ('generic', 'knackebrod', 'Knäckebröd', null, 336, 9, 70, 1.5, null),
  ('generic', 'musli', 'Müsli', null, 375, 9, 65, 8, null),
  ('generic', 'cornflakes', 'Cornflakes', null, 378, 7, 84, 0.9, null),
  ('generic', 'tortillabrod', 'Tortillabröd', null, 289, 8, 48, 7, null),
  ('generic', 'riskakor', 'Riskakor', null, 387, 8, 82, 2.8, null),

  -- Baljväxter
  ('generic', 'svarta-bonor-kokta', 'Svarta bönor, kokta', null, 132, 8.9, 24, 0.5, null),
  ('generic', 'kidneybonor-kokta', 'Kidneybönor, kokta', null, 127, 8.7, 23, 0.5, null),
  ('generic', 'gula-artor-kokta', 'Gula ärtor, kokta', null, 118, 8, 21, 0.4, null),
  ('generic', 'edamame', 'Edamame', null, 121, 11, 9.9, 5.2, null),

  -- Protein/kött/fisk
  ('generic', 'kalkonfile', 'Kalkonfilé, tillagad', null, 135, 30, 0, 1, null),
  ('generic', 'bacon-stekt', 'Bacon, stekt', null, 541, 37, 1.3, 42, null),
  ('generic', 'kokt-skinka', 'Skinka, kokt', null, 145, 21, 1.5, 5.5, null),
  ('generic', 'tonfisk-konserv', 'Tonfisk, konserv i vatten', null, 116, 26, 0, 0.8, null),
  ('generic', 'sardiner-konserv', 'Sardiner, konserv', null, 208, 25, 0, 11, null),
  ('generic', 'kycklinglarfile', 'Kycklinglårfilé, tillagad', null, 177, 26, 0, 8, null),
  ('generic', 'oxfile-tillagad', 'Oxfilé, tillagad', null, 250, 27, 0, 15, null),
  ('generic', 'chorizo', 'Chorizo', null, 455, 24, 2, 38, null),

  -- Såser/fetter/kryddor
  ('generic', 'ketchup', 'Ketchup', null, 112, 1.2, 27, 0.2, null),
  ('generic', 'senap', 'Senap', null, 100, 5, 8, 5, null),
  ('generic', 'majonnas', 'Majonnäs', null, 680, 1, 1, 75, null),
  ('generic', 'sojasas', 'Sojasås', null, 60, 6, 6, 0, null),
  ('generic', 'honung', 'Honung', null, 304, 0.3, 82, 0, null),
  ('generic', 'bbq-sas', 'BBQ-sås', null, 172, 1, 40, 0.5, null),
  ('generic', 'rapsolja', 'Rapsolja', null, 884, 0, 0, 100, null),
  ('generic', 'kokosolja', 'Kokosolja', null, 862, 0, 0, 100, null),

  -- Snacks/godis
  ('generic', 'chips', 'Chips', null, 536, 6.6, 53, 34, null),
  ('generic', 'popcorn', 'Popcorn', null, 387, 12, 78, 4.5, null),
  ('generic', 'choklad-mjolk', 'Choklad, mjölk', null, 535, 7.3, 59, 30, null),
  ('generic', 'choklad-mork', 'Choklad, mörk', null, 546, 7.8, 46, 31, null),
  ('generic', 'kex-digestive', 'Digestivekex', null, 471, 7, 62, 21, null),
  ('generic', 'proteinbar', 'Proteinbar', null, 380, 30, 35, 12, null),
  ('generic', 'lakrits', 'Lakrits', null, 350, 2, 85, 0.5, null),
  ('generic', 'gott-och-blandat', 'Gott & blandat', null, 340, 5, 78, 0, null),

  -- Fler vardagsrätter/frukost/efterrätt
  ('generic', 'aggrora', 'Äggröra', null, 145, 12, 1, 10, null),
  ('generic', 'stekt-agg', 'Stekt ägg', null, 196, 14, 0.6, 15, null),
  ('generic', 'fransk-toast', 'Fransk toast', null, 229, 8, 24, 11, null),
  ('generic', 'smorgastarta', 'Smörgåstårta', null, 220, 7, 15, 15, null),
  ('generic', 'morotskaka', 'Morotskaka', null, 350, 4, 40, 19, null),
  ('generic', 'chokladtarta', 'Chokladtårta', null, 380, 5, 42, 21, null),
  ('generic', 'cheesecake', 'Cheesecake', null, 321, 5, 26, 22, null),
  ('generic', 'tiramisu', 'Tiramisu', null, 283, 5, 29, 16, null),
  ('generic', 'panna-cotta', 'Panna cotta', null, 250, 3, 20, 17, null),
  ('generic', 'paella', 'Paella', null, 160, 9, 20, 5, null),
  ('generic', 'goulash-ungersk', 'Ungersk gulasch', null, 130, 9, 8, 6.5, null),
  ('generic', 'falafeltallrik', 'Falafeltallrik', null, 190, 7, 20, 8, null),
  ('generic', 'chicken-nuggets', 'Chicken nuggets', null, 296, 15, 16, 19, null),
  ('generic', 'proteinshake', 'Proteinshake', null, 110, 20, 4, 1.5, null),
  ('generic', 'smoothie-frukt', 'Fruktsmoothie', null, 60, 1, 14, 0.2, null),
  ('generic', 'risgrynsgrot', 'Risgrynsgröt', null, 120, 3, 20, 3, null);
