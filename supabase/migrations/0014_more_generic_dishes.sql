-- Large batch of curated Swedish/international home-cooked and takeaway dishes,
-- for when Open Food Facts' barcode-centric database doesn't have a plated
-- meal. Portion sizes live only in src/lib/genericFoods.ts, not the DB — meal_logs
-- always stores grams. Kept in sync by hand with that file.
insert into public.food_items
  (source, external_id, name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, created_by)
values
  -- Husmanskost
  ('generic', 'flaskkotlett-makaroner', 'Fläskkotlett med stuvade makaroner', null, 200, 12, 12, 11, null),
  ('generic', 'kroppkakor', 'Kroppkakor med lingon', null, 180, 7, 22, 7, null),
  ('generic', 'kaldolmar', 'Kåldolmar med potatis och lingon', null, 160, 9, 14, 7, null),
  ('generic', 'dillkott', 'Dillkött med potatis', null, 150, 12, 8, 8, null),
  ('generic', 'kokt-torsk-aggsas', 'Kokt torsk med äggsås och potatis', null, 130, 14, 10, 3.5, null),
  ('generic', 'stekt-stromming', 'Stekt strömming med potatismos', null, 200, 12, 12, 12, null),
  ('generic', 'sill-potatis', 'Sill och potatis med gräddfil', null, 170, 8, 12, 10, null),
  ('generic', 'rotmos-flask', 'Rotmos med fläsk', null, 150, 6, 12, 9, null),
  ('generic', 'ugnspannkaka', 'Ugnspannkaka med fläsk', null, 210, 8, 18, 12, null),
  ('generic', 'isterband', 'Isterband med rotmos', null, 230, 9, 12, 16, null),
  ('generic', 'kalvsylta', 'Kalvsylta med rödbetor', null, 180, 14, 4, 12, null),
  ('generic', 'blodpudding', 'Blodpudding med lingon och bacon', null, 220, 9, 20, 12, null),
  ('generic', 'rimmad-oxbringa', 'Rimmad oxbringa med rotmos', null, 180, 15, 8, 10, null),

  -- Pasta
  ('generic', 'spaghetti-bolognese', 'Spaghetti bolognese', null, 155, 7, 17, 6, null),
  ('generic', 'pasta-carbonara', 'Pasta carbonara', null, 200, 8, 18, 11, null),
  ('generic', 'pasta-pesto', 'Pasta med pesto', null, 180, 6, 22, 8, null),
  ('generic', 'makaroner-koettfarssas', 'Makaroner med köttfärssås', null, 150, 7, 16, 6, null),

  -- Asiatiskt
  ('generic', 'kycklingwok', 'Kycklingwok med nudlar', null, 140, 9, 15, 5, null),
  ('generic', 'pad-thai', 'Pad thai', null, 165, 8, 20, 6, null),
  ('generic', 'ramen-flask', 'Ramen med fläsk', null, 110, 6, 12, 4, null),
  ('generic', 'dumplings', 'Dumplings/gyoza', null, 200, 8, 22, 9, null),
  ('generic', 'nasi-goreng', 'Nasi goreng', null, 170, 7, 22, 6, null),

  -- Indiskt/curry
  ('generic', 'tikka-masala', 'Kyckling tikka masala med ris', null, 150, 9, 15, 6, null),
  ('generic', 'butter-chicken', 'Butter chicken med ris', null, 170, 9, 16, 8, null),
  ('generic', 'gronsakscurry', 'Grönsakscurry med ris', null, 120, 3, 18, 4, null),

  -- Mexikanskt
  ('generic', 'burrito', 'Burrito med kött', null, 190, 9, 20, 8, null),
  ('generic', 'quesadilla', 'Quesadilla', null, 250, 10, 22, 14, null),
  ('generic', 'nachos', 'Nachos med ost', null, 300, 8, 30, 17, null),
  ('generic', 'chili-con-carne', 'Chili con carne', null, 130, 9, 10, 6, null),

  -- Snabbmat
  ('generic', 'hamburgare', 'Hamburgare med bröd', null, 250, 13, 20, 13, null),
  ('generic', 'cheeseburgare', 'Cheeseburgare med bröd', null, 270, 14, 20, 15, null),
  ('generic', 'pommes-frites', 'Pommes frites', null, 290, 3.4, 38, 14, null),
  ('generic', 'falafel-brod', 'Falafel med bröd och sås', null, 220, 8, 24, 10, null),
  ('generic', 'kebabrulle', 'Kebabrulle', null, 230, 9, 25, 11, null),

  -- Sallader
  ('generic', 'cesarsallad-kyckling', 'Cesarsallad med kyckling', null, 140, 10, 5, 9, null),
  ('generic', 'halloumisallad', 'Halloumisallad', null, 180, 8, 8, 13, null),
  ('generic', 'tonfisksallad', 'Tonfisksallad', null, 110, 10, 6, 5, null),

  -- Soppor
  ('generic', 'broccolisoppa', 'Broccolisoppa', null, 55, 3, 5, 2.5, null),
  ('generic', 'tomatsoppa', 'Tomatsoppa', null, 45, 1.5, 7, 1.5, null),
  ('generic', 'linssoppa', 'Linssoppa', null, 80, 5, 12, 1.5, null),
  ('generic', 'currysoppa-kyckling', 'Currysoppa med kyckling', null, 90, 6, 8, 4, null),

  -- Frukost
  ('generic', 'havregrynsgrot', 'Havregrynsgröt med mjölk', null, 85, 3.5, 13, 2, null),
  ('generic', 'smorgas-skinka-ost', 'Smörgås med skinka och ost', null, 260, 14, 28, 10, null),
  ('generic', 'aggrora-bacon', 'Äggröra med bacon', null, 220, 15, 1, 17, null),

  -- Grill och fisk
  ('generic', 'grillad-kyckling-potatissallad', 'Grillad kyckling med potatissallad', null, 180, 15, 10, 8, null),
  ('generic', 'revbensspjall', 'Revbensspjäll med potatissallad', null, 260, 15, 8, 18, null),
  ('generic', 'laxfile-potatis', 'Laxfilé med potatis och sås', null, 180, 15, 10, 9, null),
  ('generic', 'fish-and-chips', 'Fish and chips', null, 230, 10, 20, 12, null),

  -- Vegetariskt/veganskt
  ('generic', 'vegetarisk-lasagne', 'Vegetarisk lasagne', null, 130, 6, 14, 6, null),
  ('generic', 'linsbolognese', 'Linsbolognese med pasta', null, 130, 6, 20, 3, null),
  ('generic', 'veggieburgare', 'Veggieburgare med bröd', null, 200, 9, 22, 8, null),
  ('generic', 'halloumiwok', 'Halloumiwok', null, 160, 9, 12, 9, null),

  -- Fika/söt
  ('generic', 'kanelbulle', 'Kanelbulle', null, 350, 7, 45, 15, null),
  ('generic', 'semla', 'Semla', null, 330, 6, 33, 19, null),
  ('generic', 'vaffla-sylt-gradde', 'Våffla med sylt och grädde', null, 290, 5, 30, 16, null)
on conflict (source, external_id) do nothing;
