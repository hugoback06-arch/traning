-- Adds an 'ai_text_estimate' food_items source for meals logged via free-text
-- description (e.g. "en skål havregrynsgröt med banan"), analyzed by Claude
-- the same way photo estimates are, but from text instead of an image.
alter type food_source add value 'ai_text_estimate';
