-- Second large batch of curated dishes, broadening cuisine coverage (Italian,
-- Greek/Middle Eastern, more Asian, American, French) plus more Swedish
-- classics and gym-friendly protein meals. Portion sizes live only in
-- src/lib/genericFoods.ts, not the DB — meal_logs always stores grams.
-- Kept in sync by hand with that file.
insert into public.food_items
  (source, external_id, name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, created_by)
values
  -- Fler svenska klassiker
  ('generic', 'wallenbergare', 'Wallenbergare med gröna ärtor och potatismos', null, 240, 10, 10, 18, null),
  ('generic', 'skagenrora', 'Toast Skagen', null, 260, 8, 18, 17, null),
  ('generic', 'biff-rydberg', 'Biff Rydberg', null, 210, 12, 12, 13, null),
  ('generic', 'kalvfile-oscar', 'Kalvfilé Oscar', null, 200, 18, 5, 12, null),
  ('generic', 'lutfisk', 'Lutfisk med vit sås och ärtor', null, 110, 12, 6, 4, null),
  ('generic', 'julskinka', 'Julskinka med sås och rödkål', null, 190, 16, 8, 10, null),
  ('generic', 'prinskorv-potatismos', 'Prinskorv med potatismos', null, 210, 8, 14, 13, null),
  ('generic', 'kottfarslimpa', 'Köttfärslimpa med sås och potatis', null, 170, 10, 12, 9, null),
  ('generic', 'palt', 'Blodpalt med fläsk och lingon', null, 200, 6, 30, 7, null),
  ('generic', 'renskav', 'Renskav med lingon och potatismos', null, 170, 11, 12, 8, null),
  ('generic', 'kalvschnitzel', 'Kalvschnitzel med potatis', null, 200, 14, 14, 10, null),

  -- Proteinmåltider / gymmat
  ('generic', 'kyckling-ris-broccoli', 'Kyckling, ris och broccoli', null, 140, 14, 15, 2.5, null),
  ('generic', 'proteinbowl-kyckling', 'Proteinbowl med kyckling och quinoa', null, 150, 13, 14, 4, null),
  ('generic', 'laxbowl-quinoa', 'Laxbowl med quinoa och avokado', null, 170, 12, 12, 8, null),
  ('generic', 'overnight-oats', 'Overnight oats med bär', null, 110, 4, 16, 3, null),
  ('generic', 'kvarg-bar-granola', 'Kvarg med bär och granola', null, 100, 9, 12, 2, null),
  ('generic', 'protein-pannkakor', 'Proteinpannkakor', null, 180, 15, 15, 6, null),
  ('generic', 'kycklingfile-sotpotatis', 'Kycklingfilé med sötpotatis och grönsaker', null, 130, 15, 12, 2.5, null),
  ('generic', 'poke-bowl-lax', 'Pokebowl med lax', null, 150, 9, 18, 5, null),
  ('generic', 'buddha-bowl', 'Buddha bowl med kikärtor', null, 130, 5, 15, 5, null),

  -- Italienskt
  ('generic', 'risotto-svamp', 'Risotto med svamp', null, 150, 4, 22, 5, null),
  ('generic', 'gnocchi-gorgonzola', 'Gnocchi med gorgonzolasås', null, 190, 6, 22, 9, null),
  ('generic', 'calzone', 'Pizza calzone', null, 260, 11, 30, 10, null),
  ('generic', 'tortellini-gradde', 'Tortellini med gräddsås', null, 200, 8, 20, 10, null),
  ('generic', 'minestrone', 'Minestronesoppa', null, 55, 2.5, 8, 1.5, null),
  ('generic', 'bruschetta', 'Bruschetta', null, 180, 4, 24, 7, null),
  ('generic', 'caprese', 'Capresesallad', null, 160, 8, 4, 13, null),
  ('generic', 'pasta-arrabbiata', 'Pasta arrabbiata', null, 140, 4, 24, 3, null),
  ('generic', 'pasta-alla-vodka', 'Pasta alla vodka', null, 190, 6, 20, 10, null),

  -- Grekiskt/mellanöstern/turkiskt
  ('generic', 'grekisk-sallad', 'Grekisk sallad', null, 110, 4, 5, 8, null),
  ('generic', 'souvlaki', 'Souvlaki med pitabröd', null, 200, 13, 18, 9, null),
  ('generic', 'gyrostallrik', 'Gyrostallrik', null, 180, 11, 12, 10, null),
  ('generic', 'hummus-pita', 'Hummus med pitabröd', null, 220, 7, 26, 9, null),
  ('generic', 'shawarma', 'Shawarma', null, 200, 10, 18, 10, null),
  ('generic', 'moussaka', 'Moussaka', null, 160, 8, 10, 10, null),
  ('generic', 'dolmar', 'Dolmar (vinbladsrullar)', null, 160, 3, 20, 8, null),
  ('generic', 'lahmacun', 'Lahmacun', null, 240, 10, 32, 8, null),
  ('generic', 'pide', 'Pide', null, 260, 11, 32, 10, null),

  -- Fler asiatiskt
  ('generic', 'pho', 'Pho (vietnamesisk nudelsoppa)', null, 90, 6, 12, 2, null),
  ('generic', 'varrullar', 'Vårrullar', null, 220, 5, 24, 11, null),
  ('generic', 'tom-yum', 'Tom yum-soppa', null, 50, 4, 5, 1.5, null),
  ('generic', 'thai-rod-curry', 'Röd curry med ris', null, 140, 6, 16, 6, null),
  ('generic', 'thai-gron-curry', 'Grön curry med ris', null, 140, 6, 16, 6, null),
  ('generic', 'bibimbap', 'Bibimbap', null, 140, 7, 18, 4.5, null),
  ('generic', 'korean-fried-chicken', 'Koreansk fried chicken med ris', null, 220, 12, 22, 10, null),
  ('generic', 'sotsur-kyckling', 'Kyckling i sursöt sås med ris', null, 160, 8, 22, 5, null),
  ('generic', 'notkott-broccoli', 'Nötkött med broccoli i ostronsås', null, 130, 10, 8, 6, null),
  ('generic', 'friterat-ris', 'Friterat ris', null, 180, 5, 26, 6, null),
  ('generic', 'chow-mein', 'Chow mein', null, 150, 6, 20, 5, null),
  ('generic', 'teriyaki-kyckling', 'Teriyakikyckling med ris', null, 160, 10, 22, 3.5, null),
  ('generic', 'katsu-curry', 'Katsu curry', null, 200, 9, 22, 8, null),
  ('generic', 'yakisoba', 'Yakisoba', null, 150, 6, 20, 5, null),

  -- Amerikanskt
  ('generic', 'mac-and-cheese', 'Mac and cheese', null, 210, 8, 20, 11, null),
  ('generic', 'pulled-pork-brod', 'BBQ pulled pork med bröd', null, 240, 14, 24, 9, null),
  ('generic', 'buffalo-wings', 'Buffalo wings', null, 250, 18, 4, 18, null),
  ('generic', 'club-sandwich', 'Club sandwich', null, 250, 13, 22, 12, null),
  ('generic', 'amerikanska-pannkakor', 'Amerikanska pannkakor med lönnsirap', null, 260, 6, 40, 8, null),

  -- Franskt
  ('generic', 'boeuf-bourguignon', 'Boeuf bourguignon', null, 160, 13, 6, 9, null),
  ('generic', 'quiche-lorraine', 'Quiche Lorraine', null, 240, 9, 14, 17, null),
  ('generic', 'ratatouille', 'Ratatouille', null, 60, 1.5, 8, 2.5, null),
  ('generic', 'crepes', 'Crêpes', null, 220, 6, 26, 9, null),

  -- Frukost/brunch
  ('generic', 'smoothie-bowl', 'Smoothie bowl', null, 100, 3, 18, 2, null),
  ('generic', 'avokadomacka', 'Avokadomacka', null, 220, 6, 20, 13, null),
  ('generic', 'frukostwrap-agg', 'Frukostwrap med ägg', null, 200, 11, 18, 9, null),
  ('generic', 'yoghurt-musli-bar', 'Yoghurt med müsli och bär', null, 85, 4, 12, 2.5, null),

  -- Smörgåsar/wraps
  ('generic', 'wrap-kyckling', 'Wrap med kyckling', null, 190, 11, 20, 7, null),
  ('generic', 'blt-macka', 'BLT-macka', null, 260, 11, 24, 13, null),
  ('generic', 'baguette-skinka-ost', 'Baguette med skinka och ost', null, 250, 12, 32, 8, null),

  -- Fler soppor
  ('generic', 'fisksoppa', 'Fisksoppa', null, 75, 8, 5, 2.5, null),
  ('generic', 'kycklingsoppa-nudlar', 'Kycklingsoppa med nudlar', null, 55, 5, 7, 1, null),
  ('generic', 'gulaschsoppa', 'Gulaschsoppa', null, 90, 7, 7, 3.5, null),
  ('generic', 'svampsoppa', 'Svampsoppa', null, 60, 2, 5, 3.5, null),

  -- Fler efterrätter/fika
  ('generic', 'chokladboll', 'Chokladboll', null, 420, 6, 45, 24, null),
  ('generic', 'prinsesstarta', 'Prinsesstårta', null, 300, 4, 38, 14, null),
  ('generic', 'ostkaka', 'Ostkaka', null, 200, 9, 18, 10, null),
  ('generic', 'appelpaj-vaniljsas', 'Äppelpaj med vaniljsås', null, 200, 3, 30, 8, null),
  ('generic', 'glass-vanilj', 'Glass, vanilj', null, 200, 3.5, 24, 10, null),

  -- Fler skaldjur/fisk
  ('generic', 'musslor-vitvinssas', 'Musslor i vitvinssås', null, 90, 11, 3, 3.5, null),
  ('generic', 'fiskpinnar-potatismos', 'Fiskpinnar med potatismos', null, 190, 9, 18, 9, null),
  ('generic', 'rakmacka', 'Räkmacka', null, 220, 10, 18, 12, null),
  ('generic', 'gravlax-dillsas', 'Gravlax med hovmästarsås', null, 200, 16, 4, 13, null),

  -- Fler sallader/bowls
  ('generic', 'couscoussallad', 'Couscoussallad med grönsaker', null, 140, 4, 24, 3.5, null),
  ('generic', 'pastasallad', 'Pastasallad', null, 160, 5, 22, 6, null),
  ('generic', 'quinoasallad', 'Quinoasallad med grönsaker', null, 130, 4, 20, 3.5, null)
on conflict (source, external_id) do nothing;
