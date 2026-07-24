-- Adds owner-only admin access to feedback_suggestions: a handled-flag and
-- RLS policies letting the app owner (hugoback06@gmail.com) read/update all
-- rows, not just their own. Powers the /admin/feedback page.
alter table public.feedback_suggestions
  add column handled boolean not null default false;

create policy "owner select all feedback" on public.feedback_suggestions
  for select using (auth.jwt() ->> 'email' = 'hugoback06@gmail.com');
create policy "owner update all feedback" on public.feedback_suggestions
  for update using (auth.jwt() ->> 'email' = 'hugoback06@gmail.com');
