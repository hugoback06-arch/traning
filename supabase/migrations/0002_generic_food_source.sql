-- Adds a 'generic' food_items source for curated Swedish staple foods (banan,
-- mjölk, etc.) that Open Food Facts' barcode-centric database covers poorly.
-- Run this migration on its own — Postgres does not allow using a new enum
-- value in the same transaction/script that adds it, so the seed data in
-- 0003_seed_generic_foods.sql must be run as a separate step afterward.
alter type food_source add value 'generic';
