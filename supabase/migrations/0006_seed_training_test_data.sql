-- ============================================================================
-- Test-/dev-seed för träningsdelen — INTE riktig produktionsdata.
-- Skapar ett exempel-schema + pass för en vecka runt 2026-07-20 (mån 07-20 –
-- sön 07-26) knutet till kontot hugoback06@gmail.com, så UI:t i /training går
-- att verifiera innan strava-sync/AI-generatorn finns på riktigt. Säkert att
-- ta bort senare (radera bara raderna eller skriv en down-migration).
-- ============================================================================

do $$
declare
  v_user_id uuid;
  v_plan_id uuid;
  v_mon_session_id uuid;
  v_run_workout_id uuid;
  v_strength_workout_id uuid;
  v_squat_id uuid;
  v_bench_id uuid;
begin
  select id into v_user_id from auth.users where email = 'hugoback06@gmail.com';

  if v_user_id is null then
    raise notice 'Ingen användare med den e-posten hittades — hoppar över seed.';
    return;
  end if;

  -- Övningsbibliotek (globalt, inte kopplat till en specifik användare)
  insert into public.exercises (name, muscle_group, equipment, is_custom)
  values ('Knäböj', 'ben', 'skivstång', false)
  returning id into v_squat_id;

  insert into public.exercises (name, muscle_group, equipment, is_custom)
  values ('Bänkpress', 'bröst', 'skivstång', false)
  returning id into v_bench_id;

  -- Strava-anslutning (dummy-token, bara för att visa "senaste synk"-raden)
  insert into public.fitness_connections
    (user_id, provider, external_athlete_id, access_token, connected_at, last_synced_at)
  values
    (v_user_id, 'strava', '123456', 'seed-placeholder-token', now() - interval '30 days', now());

  -- Aktivt AI-schema för veckan 2026-07-20 – 2026-07-26
  insert into public.training_plans (user_id, name, goal, source_prompt, start_date, status)
  values (
    v_user_id,
    'Sommarschema',
    'Öka löpvolym och bygga grundstyrka',
    'Jag vill springa mer och bli starkare inför hösten',
    '2026-07-20',
    'active'
  )
  returning id into v_plan_id;

  insert into public.training_plan_sessions
    (training_plan_id, scheduled_date, activity_type, title, description, target_data)
  values
    (v_plan_id, '2026-07-20', 'running', 'Löpning 8 km', 'Lugnt tempo, puls zon 2.', '{"distance_km": 8, "pace": "5:30/km"}'),
    (v_plan_id, '2026-07-21', 'rest', 'Vila', null, null),
    (v_plan_id, '2026-07-22', 'strength', 'Styrka – ben', '4 set knäböj, 3 set bänkpress.', '{"sets": 4, "reps": 8}'),
    (v_plan_id, '2026-07-23', 'rest', 'Vila', null, null),
    (v_plan_id, '2026-07-24', 'running', 'Löpning 5 km', 'Intervaller, 5x1000m.', '{"distance_km": 5}'),
    (v_plan_id, '2026-07-25', 'cycling', 'Cykling 40 km', 'Långpass i lugnt tempo.', '{"distance_km": 40}'),
    (v_plan_id, '2026-07-26', 'rest', 'Vila', null, null);

  select id into v_mon_session_id from public.training_plan_sessions
    where training_plan_id = v_plan_id and scheduled_date = '2026-07-20';

  -- Genomfört löppass idag (måndag), synkat från Strava, kopplat till schemat
  insert into public.workouts (
    user_id, source, external_id, activity_type, title, started_at, duration_seconds,
    distance_meters, calories_burned, avg_heart_rate, max_heart_rate,
    elevation_gain_meters, perceived_exertion, training_plan_session_id
  )
  values (
    v_user_id, 'strava', 'seed-strava-1', 'running', 'Morgonlöpning',
    '2026-07-20 07:15:00+00', 2520, 8200, 560, 152, 171, 45, 6, v_mon_session_id
  )
  returning id into v_run_workout_id;

  update public.training_plan_sessions set completed_workout_id = v_run_workout_id where id = v_mon_session_id;

  insert into public.workout_evaluations (workout_id, user_id, summary, feedback, score)
  values (
    v_run_workout_id, v_user_id, 'Bra tempo ↑',
    'Jämn puls hela passet och du höll planerat tempo. Bra grund inför nästa veckas intervaller.',
    8
  );

  insert into public.calorie_adjustments (user_id, workout_id, adjustment_date, extra_kcal, reason)
  values (v_user_id, v_run_workout_id, '2026-07-20', 340, 'Löppass, 560 kcal förbrända');

  -- Spontant kvällspass idag, inte schemalagt (visas som "Extra" på Idag-sidan)
  insert into public.workouts (
    user_id, source, external_id, activity_type, title, started_at, duration_seconds,
    distance_meters, calories_burned
  )
  values (
    v_user_id, 'strava', 'seed-strava-2', 'cycling', 'Kvällscykling',
    '2026-07-20 18:00:00+00', 2700, 15000, 310
  );

  -- Historiskt styrkepass för Historik-vyn (innan schemat startade)
  insert into public.workouts (user_id, source, activity_type, title, started_at, duration_seconds)
  values (v_user_id, 'manual', 'strength', 'Styrka – överkropp & ben', '2026-07-18 17:00:00+00', 3600)
  returning id into v_strength_workout_id;

  insert into public.workout_sets (workout_id, exercise_id, set_number, reps, weight_kg)
  values
    (v_strength_workout_id, v_squat_id, 1, 8, 80),
    (v_strength_workout_id, v_squat_id, 2, 8, 85),
    (v_strength_workout_id, v_squat_id, 3, 6, 90),
    (v_strength_workout_id, v_squat_id, 4, 6, 90),
    (v_strength_workout_id, v_bench_id, 1, 8, 60),
    (v_strength_workout_id, v_bench_id, 2, 8, 62.5),
    (v_strength_workout_id, v_bench_id, 3, 6, 65);

  insert into public.workout_evaluations (workout_id, user_id, summary, feedback, score)
  values (
    v_strength_workout_id, v_user_id, 'Stabil progression',
    'Du ökade vikten på knäböj jämfört med förra passet utan att tappa reps. Bra jobbat.',
    7
  );
end $$;
