-- Bucket per le foto dei piatti caricate da MediaGallery.tsx. Pubblico in
-- lettura (le ricette public devono mostrare le foto senza autenticazione,
-- stesso criterio già usato per recipes.visibility='public'); scrittura solo
-- al proprietario, tramite path con prefisso {user_id}/... (stesso pattern
-- "ownership by path prefix" raccomandato da Supabase Storage).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recipe-photos', 'recipe-photos', true, 8388608, array['image/jpeg','image/png','image/webp','image/heic'])
on conflict (id) do nothing;

drop policy if exists "recipe_photos_public_read" on storage.objects;
create policy "recipe_photos_public_read" on storage.objects for select
  using (bucket_id = 'recipe-photos');

drop policy if exists "recipe_photos_owner_insert" on storage.objects;
create policy "recipe_photos_owner_insert" on storage.objects for insert
  with check (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "recipe_photos_owner_delete" on storage.objects;
create policy "recipe_photos_owner_delete" on storage.objects for delete
  using (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = auth.uid()::text);
