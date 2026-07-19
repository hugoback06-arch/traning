-- Kost-spårning MVP: initial schema
-- profiles extends auth.users 1:1; food_items is a shared cache for both
-- Open Food Facts products and normalized AI photo estimates; meal_logs and
-- water_logs are per-user logs. No separate streak table — streaks are
-- derived client-side from meal_logs.

create type sex_type as enum ('male', 'female', 'other');
create type activity_level as enum ('sedentary', 'light', 'moderate', 'active', 'very_active');
create type weight_goal as enum ('lose', 'maintain', 'gain');
create type meal_type as enum ('breakfast', 'lunch', 'dinner', 'snack');
create type food_source as enum ('open_food_facts', 'ai_estimate');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  birth_date date,
  sex sex_type,
  height_cm numeric(5,1),
  weight_kg numeric(5,1),
  activity_level activity_level,
  goal weight_goal,
  daily_calorie_goal integer,
  protein_goal_g numeric(6,1),
  carbs_goal_g numeric(6,1),
  fat_goal_g numeric(6,1),
  water_goal_ml integer not null default 2000,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.food_items (
  id uuid primary key default gen_random_uuid(),
  source food_source not null,
  external_id text,
  name text not null,
  brand text,
  calories_per_100g numeric(7,2) not null,
  protein_per_100g numeric(6,2) not null,
  carbs_per_100g numeric(6,2) not null,
  fat_per_100g numeric(6,2) not null,
  image_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  constraint food_items_external_id_unique unique (source, external_id)
);

create table public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_item_id uuid not null references public.food_items(id),
  amount_g numeric(7,1) not null check (amount_g > 0),
  meal_type meal_type not null,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index meal_logs_user_logged_at_idx on public.meal_logs (user_id, logged_at desc);

create table public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_ml integer not null check (amount_ml > 0),
  logged_at timestamptz not null default now()
);
create index water_logs_user_logged_at_idx on public.water_logs (user_id, logged_at desc);

-- keep profiles.updated_at current on manual edits (e.g. profile settings)
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- auto-create a blank profile row on signup so the app can always assume one exists
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
create policy "select own profile" on public.profiles for select using (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);
create policy "insert own profile" on public.profiles for insert with check (auth.uid() = id);

alter table public.food_items enable row level security;
create policy "read shared food items" on public.food_items for select to authenticated using (true);
create policy "insert food items" on public.food_items for insert to authenticated with check (created_by = auth.uid());

alter table public.meal_logs enable row level security;
create policy "manage own meal logs" on public.meal_logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.water_logs enable row level security;
create policy "manage own water logs" on public.water_logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
