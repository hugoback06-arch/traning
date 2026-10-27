-- 1) AI-kvot: varje anrop till en AI-funktion (beskriv, foto, recept) räknas
--    per användare och typ i ett rullande 24-timmarsfönster, så att en enskild
--    inloggad användare inte kan driva upp Anthropic-kostnaden obegränsat.
--    Edge Functions anropar consume_ai_quota med användarens JWT; taket per typ
--    bestäms i supabase/functions/_shared/aiQuota.ts.
create table public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now()
);
create index ai_usage_user_kind_created_idx on public.ai_usage (user_id, kind, created_at desc);

alter table public.ai_usage enable row level security;
create policy "select own ai usage" on public.ai_usage for select using (auth.uid() = user_id);
-- Ingen insert-policy: rader skapas bara via consume_ai_quota nedan.

create function public.consume_ai_quota(p_kind text, p_limit integer)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_count integer;
begin
  if v_user is null then
    return false;
  end if;

  -- Serialisera samtidiga anrop för samma användare/typ så att taket håller.
  perform pg_advisory_xact_lock(hashtext(v_user::text || ':' || p_kind));

  delete from ai_usage where user_id = v_user and created_at < now() - interval '2 days';

  select count(*) into v_count
  from ai_usage
  where user_id = v_user and kind = p_kind and created_at > now() - interval '24 hours';

  if v_count >= p_limit then
    return false;
  end if;

  insert into ai_usage (user_id, kind) values (v_user, p_kind);
  return true;
end;
$$;

revoke all on function public.consume_ai_quota(text, integer) from public, anon;
grant execute on function public.consume_ai_quota(text, integer) to authenticated;

-- 2) Fellogg: fel från webbappen (och Edge Functions) sparas här så att ägaren
--    ser dem på /admin/errors utan extern tjänst.
create table public.error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  origin text not null check (char_length(origin) <= 100),
  message text not null check (char_length(message) <= 2000),
  stack text check (char_length(stack) <= 8000),
  context jsonb,
  url text check (char_length(url) <= 500),
  user_agent text check (char_length(user_agent) <= 500),
  created_at timestamptz not null default now()
);
create index error_logs_created_idx on public.error_logs (created_at desc);

alter table public.error_logs enable row level security;
create policy "insert own error logs" on public.error_logs
  for insert to authenticated with check (auth.uid() = user_id);
create policy "owner select error logs" on public.error_logs
  for select using (auth.jwt() ->> 'email' = 'hugoback06@gmail.com');
create policy "owner delete error logs" on public.error_logs
  for delete using (auth.jwt() ->> 'email' = 'hugoback06@gmail.com');

-- 3) Inköpslista: ingredienser från recept, en rad per ingrediens och recept.
--    Klienten slår ihop rader med samma namn vid visning.
create table public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  amount text not null default '' check (char_length(amount) <= 100),
  recipe_title text check (char_length(recipe_title) <= 200),
  checked boolean not null default false,
  created_at timestamptz not null default now()
);
create index shopping_list_items_user_idx on public.shopping_list_items (user_id, created_at);

alter table public.shopping_list_items enable row level security;
create policy "manage own shopping list" on public.shopping_list_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4) Egen källa för måltider som loggats från ett recept, så att de går att
--    skilja från fritextuppskattningar i historiken.
alter type food_source add value if not exists 'recipe';
