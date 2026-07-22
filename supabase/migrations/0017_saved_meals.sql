-- Sparade måltider: användardefinierade kombinationer av flera livsmedel som
-- loggas som en enhet (t.ex. "Min frukost" = havregrynsgröt + banan + mjölk).
-- saved_meal_items har ingen egen user_id — ägarskap nås via join mot
-- saved_meals, samma mönster som workout_sets/training_plan_sessions
-- (0005_training_schema.sql) använder för sina barn-tabeller.

create table public.saved_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  created_at timestamptz not null default now()
);
create index saved_meals_user_idx on public.saved_meals (user_id, created_at desc);

create table public.saved_meal_items (
  id uuid primary key default gen_random_uuid(),
  saved_meal_id uuid not null references public.saved_meals(id) on delete cascade,
  food_item_id uuid not null references public.food_items(id),
  amount_g numeric(7,1) not null check (amount_g > 0),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index saved_meal_items_meal_idx on public.saved_meal_items (saved_meal_id, sort_order);

alter table public.saved_meals enable row level security;
create policy "manage own saved meals" on public.saved_meals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.saved_meal_items enable row level security;
create policy "access items via own saved meal" on public.saved_meal_items
  for all using (
    exists (
      select 1 from public.saved_meals m
      where m.id = saved_meal_items.saved_meal_id and m.user_id = auth.uid()
    )
  );
