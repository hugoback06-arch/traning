-- ============================================================================
-- Puls-/temposerier (Strava streams-endpointen) för graf i passdetaljvyn.
-- Lagras nedsamplad (resolution=medium, se _shared/stravaActivity.ts) som
-- {time: number[], heartrate: number[] | null, velocity_smooth: number[] | null}
-- så en enskild rad aldrig blir orimligt stor oavsett passets längd.
-- ============================================================================

alter table public.workouts
  add column if not exists streams jsonb;
