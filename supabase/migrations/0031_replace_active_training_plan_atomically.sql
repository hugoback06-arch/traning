-- A plan replacement consists of three dependent writes. Keeping them in one
-- function makes PostgreSQL roll back every write if any session is invalid.
create or replace function public.replace_active_training_plan(
  p_name text,
  p_goal text,
  p_source_prompt text,
  p_start_date date,
  p_days jsonb
) returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_plan_id uuid;
  v_day_count integer := jsonb_array_length(p_days);
begin
  if v_day_count is null or v_day_count < 1 then
    raise exception 'Ett schema måste innehålla minst en dag';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_days) with ordinality as entry(day, ordinal)
    where day ->> 'scheduled_date' <> to_char(p_start_date + (ordinal::integer - 1), 'YYYY-MM-DD')
  ) then
    raise exception 'Schemat innehåller ogiltiga eller osorterade datum';
  end if;

  update public.training_plans
  set status = 'archived'
  where user_id = auth.uid() and status = 'active';

  insert into public.training_plans (user_id, name, goal, source_prompt, start_date, end_date, status)
  values (auth.uid(), p_name, p_goal, p_source_prompt, p_start_date, p_start_date + (v_day_count - 1), 'active')
  returning id into v_plan_id;

  insert into public.training_plan_sessions (training_plan_id, scheduled_date, activity_type, title, description, target_data)
  select
    v_plan_id,
    (day ->> 'scheduled_date')::date,
    day ->> 'activity_type',
    day ->> 'title',
    day ->> 'description',
    day -> 'target_data'
  from jsonb_array_elements(p_days) as entry(day);

  return v_plan_id;
end;
$$;
