-- ============================================================================
-- Säkerhetsfix: OAuth account-linking CSRF i Strava-anslutningen.
--
-- Tidigare kopplade strava-oauth-callback ihop fitness_connections direkt mot
-- oauth_states.user_id — dvs vem som helst som STARTADE flowet, inte
-- nödvändigtvis den webbläsare/användare som faktiskt loggade in på Strava och
-- godkände. En attacker kunde starta flowet som sig själv, skicka authorize-
-- länken till ett offer, och om offret godkände hamnade offrets Strava-tokens
-- kopplade till attackerarens konto.
--
-- Fixen: callbacken lagrar nu bara tokens temporärt på oauth_states-raden och
-- redirectar till /profile?strava=pending&state=... — själva kopplingen mot
-- fitness_connections görs av strava-oauth-finalize, en autentiserad funktion
-- som körs med anropande användares JWT. RLS-policyn "manage own oauth states"
-- (auth.uid() = user_id) garanterar att bara den användare som faktiskt startade
-- flowet kan slå upp och slutföra den pending-raden.
-- ============================================================================
alter table public.oauth_states
  add column if not exists pending_access_token text,
  add column if not exists pending_refresh_token text,
  add column if not exists pending_expires_at timestamptz,
  add column if not exists pending_external_athlete_id text,
  add column if not exists pending_scope text;
