alter view public.v_chef_public_profile set (security_invoker = true);
alter view public.v_booking_revenue set (security_invoker = true);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create or replace function public.log_audit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_logs(actor_id, action, entity, entity_id, metadata)
  values (auth.uid(), TG_OP, TG_TABLE_NAME, coalesce(new.id, old.id), row_to_json(coalesce(new, old))::jsonb);
  return coalesce(new, old);
end; $$;

create or replace function public.update_chef_rating()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.chefs c
  set rating_count = sub.cnt, rating_avg = sub.avg
  from (
    select chef_id, count(*) cnt, round(avg(rating)::numeric,2) avg
    from public.reviews where chef_id = new.chef_id group by chef_id
  ) sub
  where c.id = new.chef_id;
  return new;
end; $$;

revoke execute on function public.handle_new_user() from anon, authenticated;
