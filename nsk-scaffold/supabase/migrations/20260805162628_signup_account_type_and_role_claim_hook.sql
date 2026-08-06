-- Il segnale "professionista vs cliente" scelto in fase di signup viene letto
-- da raw_user_meta_data (campo utente, basso trust) e tradotto nel role reale
-- di profiles (solo 'customer' o 'chef': 'admin' non è mai auto-assegnabile).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  requested_type text := new.raw_user_meta_data->>'account_type';
  assigned_role public.user_role := case
    when requested_type = 'chef' then 'chef'::public.user_role
    else 'customer'::public.user_role
  end;
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    assigned_role
  )
  on conflict (id) do nothing;
  return new;
end; $$;

-- Auth Hook "Customize Access Token (JWT) Claims": copia profiles.role nel
-- claim app_metadata.role del JWT ad ogni login/refresh. Va abilitato una
-- volta sola in Supabase Dashboard → Authentication → Hooks → "Customize
-- Access Token (JWT) Claims hook" (nessuna API/migration può farlo).
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  claims jsonb;
  found_role public.user_role;
begin
  select role into found_role from public.profiles where id = (event->>'user_id')::uuid;

  claims := coalesce(event->'claims', '{}'::jsonb);
  if found_role is not null then
    claims := jsonb_set(claims, '{app_metadata,role}', to_jsonb(found_role::text));
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;
grant select on public.profiles to supabase_auth_admin;
