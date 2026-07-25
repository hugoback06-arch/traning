-- Upserting a push subscription (e.g. re-enabling notiser after the DB row
-- was deleted but the browser still holds the same PushManager subscription)
-- goes through an UPDATE path on conflict, which needs its own RLS policy.
create policy "update own push subscriptions" on public.push_subscriptions
  for update using (auth.uid() = user_id);
