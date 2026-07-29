-- Per-användare minne av tidigare rättade AI-uppskattningar (foto/text).
-- Skrivs av klienten när en AI-uppskattad måltid loggas; läses av
-- analyze-meal-text/analyze-meal-photo för att slå upp om den aktuella
-- rätten redan har kända, av användaren rättade näringsvärden.
create table public.food_corrections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_name text not null check (char_length(food_name) between 1 and 200),
  calories_per_100g numeric(7,1) not null check (calories_per_100g >= 0),
  protein_per_100g numeric(7,1) not null check (protein_per_100g >= 0),
  carbs_per_100g numeric(7,1) not null check (carbs_per_100g >= 0),
  fat_per_100g numeric(7,1) not null check (fat_per_100g >= 0),
  updated_at timestamptz not null default now(),
  unique (user_id, food_name)
);
create index food_corrections_user_idx on public.food_corrections (user_id, updated_at desc);

alter table public.food_corrections enable row level security;
create policy "manage own food corrections" on public.food_corrections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
