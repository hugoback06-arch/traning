-- ============================================================================
-- Träningsdelen: datamodell
-- Följer samma mönster som kost-delen: RLS per user_id, UUID PK, timestamptz
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Externa kopplingar (Strava / Garmin)
-- ---------------------------------------------------------------------------
create table if not exists public.fitness_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('strava', 'garmin')),
  external_athlete_id text,
  access_token text not null,       -- krypteras/hanteras via Edge Function, aldrig i klienten
  refresh_token text,
  expires_at timestamptz,
  scope text,
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz,
  unique (user_id, provider)
);

alter table public.fitness_connections enable row level security;

create policy "select own connections" on public.fitness_connections
  for select using (auth.uid() = user_id);
create policy "modify own connections" on public.fitness_connections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 2. Övningsbibliotek (för styrketräning)
-- ---------------------------------------------------------------------------
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  muscle_group text,               -- t.ex. 'bröst', 'rygg', 'ben', 'axlar', 'core'
  equipment text,                  -- t.ex. 'skivstång', 'kroppsvikt', 'kabel'
  is_custom boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Övningsbiblioteket är läsbart för alla, men bara egna custom-övningar redigerbara
alter table public.exercises enable row level security;
create policy "read all exercises" on public.exercises for select using (true);
create policy "manage own custom exercises" on public.exercises
  for all using (auth.uid() = created_by) with check (auth.uid() = created_by);

-- ---------------------------------------------------------------------------
-- 3. Träningspass (både kondition och styrka, oavsett källa)
-- ---------------------------------------------------------------------------
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  source text not null default 'manual'
    check (source in ('manual', 'strava', 'garmin', 'ai_plan')),
  external_id text,                -- Strava/Garmin activity-id, för dedupe vid synk

  activity_type text not null
    check (activity_type in ('running', 'cycling', 'swimming', 'strength', 'walking', 'other')),
  title text,

  started_at timestamptz not null,
  duration_seconds integer,
  distance_meters numeric,
  calories_burned integer,
  avg_heart_rate integer,
  max_heart_rate integer,
  elevation_gain_meters numeric,
  perceived_exertion smallint check (perceived_exertion between 1 and 10),

  training_plan_session_id uuid,   -- kopplas mot schemalagt pass, se tabell 5
  raw_data jsonb,                  -- oformaterad payload från Strava/Garmin för framtida bruk

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, source, external_id)
);

create index if not exists workouts_user_started_idx
  on public.workouts (user_id, started_at desc);

alter table public.workouts enable row level security;
create policy "select own workouts" on public.workouts
  for select using (auth.uid() = user_id);
create policy "modify own workouts" on public.workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 4. Styrkeset (rader i ett styrkepass)
-- ---------------------------------------------------------------------------
create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  set_number smallint not null,
  reps smallint,
  weight_kg numeric,
  rpe smallint check (rpe between 1 and 10),
  rest_seconds integer,
  created_at timestamptz not null default now()
);

create index if not exists workout_sets_workout_idx on public.workout_sets (workout_id);

alter table public.workout_sets enable row level security;
create policy "access sets via own workout" on public.workout_sets
  for all using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_sets.workout_id and w.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 5. AI-genererade träningsscheman
-- ---------------------------------------------------------------------------
create table if not exists public.training_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  goal text,                       -- t.ex. 'öka 5k-tid', 'bygga styrka', 'gå ner i vikt'
  source_prompt text,              -- promptet användaren skrev till AI-boten
  start_date date not null,
  end_date date,
  status text not null default 'active'
    check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default now()
);

alter table public.training_plans enable row level security;
create policy "manage own training plans" on public.training_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.training_plan_sessions (
  id uuid primary key default gen_random_uuid(),
  training_plan_id uuid not null references public.training_plans(id) on delete cascade,
  scheduled_date date not null,
  activity_type text not null
    check (activity_type in ('running', 'cycling', 'swimming', 'strength', 'walking', 'rest', 'other')),
  title text not null,
  description text,                -- t.ex. "5 km i lugnt tempo, puls zon 2"
  target_data jsonb,                -- strukturerad target: {distance_km, pace, sets, reps, ...}
  completed_workout_id uuid references public.workouts(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists plan_sessions_plan_idx
  on public.training_plan_sessions (training_plan_id, scheduled_date);

alter table public.training_plan_sessions enable row level security;
create policy "access sessions via own plan" on public.training_plan_sessions
  for all using (
    exists (
      select 1 from public.training_plans p
      where p.id = training_plan_sessions.training_plan_id and p.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 6. AI-utvärderingar av pass
-- ---------------------------------------------------------------------------
create table if not exists public.workout_evaluations (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  summary text not null,            -- kort AI-sammanfattning av passet
  feedback text,                    -- längre AI-feedback/rekommendation
  score smallint check (score between 1 and 10),
  created_at timestamptz not null default now()
);

alter table public.workout_evaluations enable row level security;
create policy "manage own evaluations" on public.workout_evaluations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 7. Kaloriekoppling mot kost-delen
-- Ett pass kan generera ett "kalori-tillägg" som appliceras på dagens kostmål.
-- Hålls som egen tabell (inte direkt mutation av profildata) så historiken
-- är spårbar och kan räknas om om ett pass raderas/redigeras.
-- ---------------------------------------------------------------------------
create table if not exists public.calorie_adjustments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id uuid references public.workouts(id) on delete cascade,
  adjustment_date date not null,
  extra_kcal integer not null,
  reason text,                      -- t.ex. "Löppass, 600 kcal förbrända"
  created_at timestamptz not null default now(),
  unique (workout_id)
);

create index if not exists calorie_adjustments_user_date_idx
  on public.calorie_adjustments (user_id, adjustment_date);

alter table public.calorie_adjustments enable row level security;
create policy "manage own calorie adjustments" on public.calorie_adjustments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 8. Trigger: uppdatera updated_at på workouts
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists workouts_set_updated_at on public.workouts;
create trigger workouts_set_updated_at
  before update on public.workouts
  for each row execute function public.set_updated_at();
