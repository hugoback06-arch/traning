-- Pulszoner från Strava (athlete/zones), hämtas vid anslutning + manuell synk.
-- Ger AI-schemat riktiga träningszoner istället för gissade pulsvärden.
alter table public.fitness_connections
  add column if not exists heart_rate_zones jsonb;
