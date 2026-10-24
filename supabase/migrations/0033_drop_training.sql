-- Appen hanterar nu bara kost och hälsa. Tar bort hela träningsdelen:
-- Strava-kopplingar, pass, scheman, utvärderingar, kalorijusteringar och
-- push-prenumerationer (som bara användes av Strava-webhooken).
-- public.set_updated_at() behålls — profiles använder den.

drop function if exists public.replace_active_training_plan(text, text, text, date, jsonb);

drop table if exists public.calorie_adjustments cascade;
drop table if exists public.workout_evaluations cascade;
drop table if exists public.workout_sets cascade;
drop table if exists public.training_plan_sessions cascade;
drop table if exists public.workouts cascade;
drop table if exists public.training_plans cascade;
drop table if exists public.exercises cascade;
drop table if exists public.fitness_connection_secrets cascade;
drop table if exists public.oauth_pending_secrets cascade;
drop table if exists public.oauth_states cascade;
drop table if exists public.fitness_connections cascade;
drop table if exists public.push_subscriptions cascade;

alter table public.profiles drop column if exists notifications_enabled;
