-- ============================================================================
-- Kortlivad koppling mellan en påbörjad OAuth-flow (t.ex. "Anslut Strava") och
-- den inloggade användaren. strava-oauth-callback tas emot direkt av Strava
-- (en vanlig webbläsar-redirect, ingen Supabase-JWT bifogas), så den behöver
-- ett sätt att slå upp vem som startade flowet — det är precis vad den här
-- tabellen är till för. Raden är engångsbruk: callbacken tar bort den direkt.
-- ============================================================================
create table if not exists public.oauth_states (
  state text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('strava', 'garmin')),
  return_origin text not null,
  created_at timestamptz not null default now()
);

alter table public.oauth_states enable row level security;
create policy "manage own oauth states" on public.oauth_states
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
