alter table public.quiz_attempts add column if not exists answers jsonb;
alter table public.quiz_attempts add column if not exists ai_feedback text;

alter table public.reviews add column if not exists chef_response text;
alter table public.reviews add column if not exists chef_response_at timestamptz;

drop policy if exists "reviews_chef_respond" on public.reviews;
create policy "reviews_chef_respond" on public.reviews for update
  using (auth.uid() = chef_id)
  with check (auth.uid() = chef_id);

alter table public.recipes add column if not exists allergen_notes text;
