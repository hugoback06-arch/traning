-- duration_seconds only ever stored Strava's moving_time (excludes pauses).
-- Adds the total elapsed time (incl. pauses) and max speed, both already
-- present on the raw Strava activity but not previously promoted to columns.
alter table public.workouts
  add column elapsed_seconds integer,
  add column max_speed_ms numeric(6,2);
