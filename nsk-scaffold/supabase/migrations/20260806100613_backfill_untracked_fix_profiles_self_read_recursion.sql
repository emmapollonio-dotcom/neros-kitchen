-- Altro fix applicato in produzione via execute_sql diretto (mai tracciato
-- come migration): la versione originale di profiles_self_read (vedi
-- nsk_full_schema_v1) fa "exists (select 1 from public.profiles p where
-- ...)" dentro alla policy di SELECT su public.profiles stessa — ogni riga
-- letta rivalutava la policy su se stessa, causando "infinite recursion
-- detected in policy for relation profiles" (42P17). Fix standard Supabase:
-- isolare il controllo admin in una funzione SECURITY DEFINER (gira coi
-- privilegi del proprietario, bypassa RLS nella query interna, quindi non
-- rientra nella policy che la chiama).

create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'::user_role);
$$;

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles for select
  using (auth.uid() = id or public.is_admin());
