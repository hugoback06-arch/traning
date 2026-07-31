-- Avoid leaving an empty saved_meals row behind when one of its items fails.
create or replace function public.create_saved_meal_with_items(p_name text, p_items jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_meal_id uuid;
begin
  if nullif(trim(p_name), '') is null or jsonb_array_length(p_items) < 1 then
    raise exception 'En sparad måltid måste ha ett namn och minst en ingrediens';
  end if;

  insert into public.saved_meals (user_id, name)
  values (auth.uid(), trim(p_name))
  returning id into v_meal_id;

  insert into public.saved_meal_items (saved_meal_id, food_item_id, amount_g, sort_order)
  select v_meal_id, item.food_item_id, item.amount_g, item.sort_order
  from jsonb_to_recordset(p_items) as item(food_item_id uuid, amount_g numeric, sort_order integer);

  return v_meal_id;
end;
$$;
