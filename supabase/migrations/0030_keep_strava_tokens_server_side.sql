-- OAuth and refresh tokens must never be readable through the public REST API.
-- Keep them in server-only tables; Edge Functions access these with the
-- service-role key after authenticating/authorizing the caller where needed.
create table public.fitness_connection_secrets (
  connection_id uuid primary key references public.fitness_connections(id) on delete cascade,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.fitness_connection_secrets enable row level security;

insert into public.fitness_connection_secrets (connection_id, access_token, refresh_token, expires_at)
select id, access_token, refresh_token, expires_at
from public.fitness_connections
on conflict (connection_id) do update set
  access_token = excluded.access_token,
  refresh_token = excluded.refresh_token,
  expires_at = excluded.expires_at,
  updated_at = now();

alter table public.fitness_connections
  drop column access_token,
  drop column refresh_token,
  drop column expires_at;

-- The callback cannot trust the browser with exchanged OAuth tokens either.
create table public.oauth_pending_secrets (
  state text primary key references public.oauth_states(state) on delete cascade,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.oauth_pending_secrets enable row level security;

insert into public.oauth_pending_secrets (state, access_token, refresh_token, expires_at)
select state, pending_access_token, pending_refresh_token, pending_expires_at
from public.oauth_states
where pending_access_token is not null
on conflict (state) do update set
  access_token = excluded.access_token,
  refresh_token = excluded.refresh_token,
  expires_at = excluded.expires_at;

alter table public.oauth_states
  drop column pending_access_token,
  drop column pending_refresh_token,
  drop column pending_expires_at;
