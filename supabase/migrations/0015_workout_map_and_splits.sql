-- ============================================================================
-- Karta + splits för utförda pass (hämtas från Strava-aktivitetens detail-
-- endpoint, som redan anropas av strava-webhook/strava-manual-sync men vars
-- map/splits-fält hittills kastats bort vid upsert).
-- ============================================================================

alter table public.workouts
  add column if not exists map_polyline text,
  add column if not exists splits jsonb;
