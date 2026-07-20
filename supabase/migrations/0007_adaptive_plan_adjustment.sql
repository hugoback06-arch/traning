-- ============================================================================
-- Adaptiv schemajustering (app-spec-training-addendum.md, punkt 2)
-- ============================================================================

alter table public.training_plans
  add column if not exists intensity_preference text
  check (intensity_preference in ('lower', 'as_planned', 'higher'))
  default 'as_planned';

create table if not exists public.training_plan_adjustments (
  id uuid primary key default gen_random_uuid(),
  training_plan_id uuid not null references public.training_plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

create index if not exists plan_adjustments_plan_idx
  on public.training_plan_adjustments (training_plan_id, created_at desc);

alter table public.training_plan_adjustments enable row level security;
create policy "manage own plan adjustments" on public.training_plan_adjustments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
