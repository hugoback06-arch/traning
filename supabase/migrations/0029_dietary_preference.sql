-- Kostpreferens per användare, används av AI-måltidsförslag (och kan
-- återanvändas av fotoanalys/textuppskattning senare) för att styra bort
-- från t.ex. vegetariska förslag när användaren vill ha kött/fisk/kyckling.
alter table public.profiles
  add column dietary_preference text not null default 'any'
    check (dietary_preference in ('any', 'meat_fish_poultry', 'vegetarian', 'vegan'));
