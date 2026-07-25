-- Web push subscriptions, one row per browser/device the user has enabled
-- notiser on (src/routes/ProfileSettingsPage.tsx). Used by strava-webhook to
-- push "nytt pass synkat" notifications.
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

create policy "insert own push subscription" on public.push_subscriptions
  for insert with check (auth.uid() = user_id);
create policy "select own push subscriptions" on public.push_subscriptions
  for select using (auth.uid() = user_id);
create policy "delete own push subscriptions" on public.push_subscriptions
  for delete using (auth.uid() = user_id);
