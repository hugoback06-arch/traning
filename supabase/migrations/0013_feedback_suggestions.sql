-- Låter användare skicka in fria textförslag på ändringar/förbättringar under
-- Profil. Sparas per användare (RLS: insert/select egna rader) — ägaren läser
-- alla inskickade förslag direkt via Supabase Table Editor, ingen admin-UI ännu.
create table public.feedback_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table public.feedback_suggestions enable row level security;

create policy "insert own feedback" on public.feedback_suggestions
  for insert with check (auth.uid() = user_id);
create policy "select own feedback" on public.feedback_suggestions
  for select using (auth.uid() = user_id);
