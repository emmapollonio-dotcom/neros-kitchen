-- La policy "profiles_self_update" permette a chiunque di aggiornare la
-- propria riga, colonna role inclusa: senza restrizioni, un utente potrebbe
-- auto-assegnarsi 'admin' via chiamata diretta alla REST API di Supabase
-- (bypassando l'app). Revochiamo lo UPDATE sulla colonna role e lo
-- riapriamo solo attraverso questa funzione, che accetta solo 'customer' o
-- 'chef' — mai 'admin'.
revoke update (role) on public.profiles from authenticated;

create or replace function public.set_own_account_type(new_type text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if new_type not in ('customer', 'chef') then
    raise exception 'Tipo account non valido: %', new_type;
  end if;
  update public.profiles set role = new_type::user_role where id = auth.uid();
end;
$$;

grant execute on function public.set_own_account_type(text) to authenticated;
