-- Backfills 0024's elapsed_seconds/max_speed_ms for Strava workouts synced
-- before that migration — the raw Strava activity (with elapsed_time/
-- max_speed) was already being stored in raw_data, so no re-sync is needed.
update public.workouts
set
  elapsed_seconds = (raw_data->>'elapsed_time')::integer,
  max_speed_ms = (raw_data->>'max_speed')::numeric
where source = 'strava'
  and raw_data ? 'elapsed_time'
  and elapsed_seconds is null;
