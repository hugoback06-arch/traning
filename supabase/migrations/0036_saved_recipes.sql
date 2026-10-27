-- Sparade recept från Recept-fliken. Receptet lagras som det genererades
-- (jsonb: ingredienser, steg, näring per portion) — det är en ögonblicksbild
-- att laga igen, inte något som räknas om mot food_items i efterhand.

create table public.saved_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner')),
  recipe jsonb not null,
  created_at timestamptz not null default now()
);
create index saved_recipes_user_idx on public.saved_recipes (user_id, created_at desc);

alter table public.saved_recipes enable row level security;
create policy "manage own saved recipes" on public.saved_recipes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
