-- ============================================================================
-- Tar bort test-/dev-seeden från 0006_seed_training_test_data.sql nu när
-- riktig data (Strava-synk) börjar komma in. Matchar på de kända
-- seed-markörerna (external_id, exakt titel/tid, dummy-token) istället för
-- att radera på user_id, så riktig data för samma användare inte påverkas.
--
-- Övnings-biblioteket (Knäböj/Bänkpress) rörs INTE — det är återanvändbar
-- referensdata i samma anda som generic_foods, inte personlig mock-data.
-- ============================================================================

delete from public.workouts
where (source = 'strava' and external_id in ('seed-strava-1', 'seed-strava-2'))
   or (source = 'manual' and title = 'Styrka – överkropp & ben' and started_at = '2026-07-18 17:00:00+00');
-- (workout_sets, workout_evaluations, calorie_adjustments cascade automatically via FK)

delete from public.training_plans
where name = 'Sommarschema' and source_prompt = 'Jag vill springa mer och bli starkare inför hösten';
-- (training_plan_sessions cascade automatically via FK)

delete from public.fitness_connections
where provider = 'strava' and access_token = 'seed-placeholder-token';
