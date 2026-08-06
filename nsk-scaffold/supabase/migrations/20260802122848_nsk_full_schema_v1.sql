-- =========================================================
-- NERO'S KITCHEN (N'sK) — SUPABASE / POSTGRESQL SCHEMA
-- =========================================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ---------- ENUMS ----------
do $$ begin
  create type user_role as enum ('visitor','customer','chef','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('requested','quoted','confirmed','in_progress','completed','cancelled','disputed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending','authorized','paid','refunded','failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('trialing','active','past_due','canceled','incomplete');
exception when duplicate_object then null; end $$;

do $$ begin
  create type plan_tier as enum ('home_free','home_premium','pro_starter','pro_growth','pro_enterprise');
exception when duplicate_object then null; end $$;

-- ---------- CORE IDENTITY ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'customer',
  full_name text not null,
  avatar_url text,
  phone text,
  locale text not null default 'it',
  country text,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chefs (
  id uuid primary key references public.profiles(id) on delete cascade,
  business_name text,
  bio text,
  specialties text[],
  languages text[] default array['it'],
  years_experience int,
  hourly_rate numeric(10,2),
  event_min_price numeric(10,2),
  service_area jsonb,
  verified boolean not null default false,
  rating_avg numeric(3,2) default 0,
  rating_count int default 0,
  stripe_account_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.chef_availability (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid not null references public.chefs(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  is_booked boolean not null default false,
  external_calendar_id text,
  created_at timestamptz not null default now(),
  constraint availability_valid_range check (end_at > start_at)
);

-- ---------- RECIPES ----------
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text unique not null,
  category text,
  cuisine text,
  description text,
  servings int not null default 4,
  prep_minutes int,
  cook_minutes int,
  difficulty text,
  allergens text[],
  images text[],
  language text not null default 'it',
  visibility text not null default 'private',
  food_cost_total numeric(10,2),
  food_cost_per_serving numeric(10,2),
  suggested_price numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  default_unit text not null,
  avg_cost_per_unit numeric(10,4),
  allergens text[],
  is_scrap_reusable boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete restrict,
  quantity numeric(10,3) not null,
  unit text not null,
  cost_override numeric(10,4),
  position int default 0
);

create table if not exists public.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  step_number int not null,
  instruction text not null,
  timer_minutes int
);

-- ---------- MARKETPLACE / BOOKINGS ----------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id),
  chef_id uuid not null references public.chefs(id),
  event_type text,
  event_date timestamptz not null,
  guest_count int,
  location jsonb,
  status booking_status not null default 'requested',
  quote_amount numeric(10,2),
  currency text not null default 'EUR',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  subscription_id uuid,
  user_id uuid not null references public.profiles(id),
  amount numeric(10,2) not null,
  currency text not null default 'EUR',
  status payment_status not null default 'pending',
  stripe_payment_intent_id text,
  platform_fee numeric(10,2) default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id),
  chef_id uuid not null references public.chefs(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (booking_id)
);

-- ---------- SUBSCRIPTIONS / BILLING ----------
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code plan_tier not null unique,
  name text not null,
  price_monthly numeric(10,2),
  price_yearly numeric(10,2),
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  features jsonb not null default '{}'::jsonb
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status subscription_status not null default 'trialing',
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz not null default now()
);

-- ---------- ACADEMY ----------
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references public.chefs(id),
  title text not null,
  slug text unique not null,
  description text,
  level text,
  language text default 'it',
  price numeric(10,2) default 0,
  published boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position int not null default 0,
  video_url text,
  pdf_url text,
  duration_seconds int
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, course_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean default false,
  last_position_seconds int default 0,
  unique (enrollment_id, lesson_id)
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  questions jsonb not null default '[]'::jsonb,
  passing_score int default 70
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  score int,
  passed boolean,
  attempted_at timestamptz not null default now()
);

-- ---------- ZERO WASTE ----------
create table if not exists public.waste_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  ingredient_name text not null,
  quantity numeric(10,3),
  unit text,
  image_url text,
  logged_at timestamptz not null default now()
);

create table if not exists public.waste_suggestions (
  id uuid primary key default gen_random_uuid(),
  waste_item_id uuid not null references public.waste_items(id) on delete cascade,
  suggestion_type text,
  title text not null,
  content text,
  sustainability_score int check (sustainability_score between 0 and 100),
  ai_log_id uuid,
  created_at timestamptz not null default now()
);

-- ---------- CRM ----------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references public.chefs(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  source text,
  stage text default 'new',
  score int default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  type text,
  content text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ---------- AI / OBSERVABILITY ----------
create table if not exists public.ai_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  agent_name text not null,
  input jsonb,
  output jsonb,
  tokens_used int,
  latency_ms int,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ---------- INDEXES ----------
create index if not exists idx_recipes_owner on public.recipes(owner_id);
create index if not exists idx_recipes_visibility on public.recipes(visibility) where visibility = 'public';
create index if not exists idx_bookings_chef_status on public.bookings(chef_id, status);
create index if not exists idx_bookings_customer on public.bookings(customer_id);
create index if not exists idx_availability_chef_time on public.chef_availability(chef_id, start_at, end_at);
create index if not exists idx_leads_chef_stage on public.leads(chef_id, stage);
create index if not exists idx_ai_logs_user_agent on public.ai_logs(user_id, agent_name, created_at desc);
create index if not exists idx_reviews_chef on public.reviews(chef_id);

-- ---------- VIEWS ----------
create or replace view public.v_chef_public_profile as
  select c.id, p.full_name, c.business_name, c.bio, c.specialties, c.languages,
         c.rating_avg, c.rating_count, c.verified, c.hourly_rate, c.event_min_price
  from public.chefs c join public.profiles p on p.id = c.id
  where c.verified = true;

create or replace view public.v_booking_revenue as
  select b.chef_id, date_trunc('month', b.event_date) as month,
         count(*) as bookings_count, sum(pay.amount) as revenue
  from public.bookings b
  join public.payments pay on pay.booking_id = b.id and pay.status = 'paid'
  where b.status = 'completed'
  group by b.chef_id, date_trunc('month', b.event_date);

-- ---------- TRIGGERS ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_recipes_updated_at on public.recipes;
create trigger trg_recipes_updated_at before update on public.recipes
  for each row execute function public.set_updated_at();

drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

create or replace function public.update_chef_rating()
returns trigger language plpgsql as $$
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

drop trigger if exists trg_review_update_rating on public.reviews;
create trigger trg_review_update_rating after insert on public.reviews
  for each row execute function public.update_chef_rating();

create or replace function public.log_audit()
returns trigger language plpgsql as $$
begin
  insert into public.audit_logs(actor_id, action, entity, entity_id, metadata)
  values (auth.uid(), TG_OP, TG_TABLE_NAME, coalesce(new.id, old.id), row_to_json(coalesce(new, old))::jsonb);
  return coalesce(new, old);
end; $$;

drop trigger if exists trg_audit_bookings on public.bookings;
create trigger trg_audit_bookings after insert or update or delete on public.bookings
  for each row execute function public.log_audit();

drop trigger if exists trg_audit_payments on public.payments;
create trigger trg_audit_payments after insert or update or delete on public.payments
  for each row execute function public.log_audit();

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.chefs enable row level security;
alter table public.recipes enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.leads enable row level security;
alter table public.ai_logs enable row level security;

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles for select
  using (auth.uid() = id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);

drop policy if exists "chefs_public_read" on public.chefs;
create policy "chefs_public_read" on public.chefs for select using (verified = true or auth.uid() = id);

drop policy if exists "chefs_self_write" on public.chefs;
create policy "chefs_self_write" on public.chefs for update using (auth.uid() = id);

drop policy if exists "recipes_owner_all" on public.recipes;
create policy "recipes_owner_all" on public.recipes for all using (auth.uid() = owner_id);

drop policy if exists "recipes_public_read" on public.recipes;
create policy "recipes_public_read" on public.recipes for select using (visibility = 'public');

drop policy if exists "bookings_participants" on public.bookings;
create policy "bookings_participants" on public.bookings for select
  using (auth.uid() = customer_id or auth.uid() = chef_id);

drop policy if exists "bookings_customer_insert" on public.bookings;
create policy "bookings_customer_insert" on public.bookings for insert
  with check (auth.uid() = customer_id);

drop policy if exists "bookings_participants_update" on public.bookings;
create policy "bookings_participants_update" on public.bookings for update
  using (auth.uid() = customer_id or auth.uid() = chef_id);

drop policy if exists "payments_owner_read" on public.payments;
create policy "payments_owner_read" on public.payments for select using (auth.uid() = user_id);

drop policy if exists "payments_owner_insert_pending" on public.payments;
create policy "payments_owner_insert_pending" on public.payments for insert
  with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews for select using (true);

drop policy if exists "reviews_customer_insert" on public.reviews;
create policy "reviews_customer_insert" on public.reviews for insert with check (auth.uid() = reviewer_id);

drop policy if exists "leads_chef_owner" on public.leads;
create policy "leads_chef_owner" on public.leads for all using (auth.uid() = chef_id);

drop policy if exists "ai_logs_owner_read" on public.ai_logs;
create policy "ai_logs_owner_read" on public.ai_logs for select using (auth.uid() = user_id);

alter table public.chef_availability enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_steps enable row level security;
alter table public.ingredients enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.waste_items enable row level security;
alter table public.waste_suggestions enable row level security;
alter table public.crm_activities enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "availability_public_read" on public.chef_availability;
create policy "availability_public_read" on public.chef_availability for select using (true);
drop policy if exists "availability_chef_write" on public.chef_availability;
create policy "availability_chef_write" on public.chef_availability for all using (auth.uid() = chef_id);

drop policy if exists "recipe_ingredients_read" on public.recipe_ingredients;
create policy "recipe_ingredients_read" on public.recipe_ingredients for select
  using (exists (select 1 from public.recipes r where r.id = recipe_id and (r.visibility = 'public' or r.owner_id = auth.uid())));
drop policy if exists "recipe_ingredients_owner_write" on public.recipe_ingredients;
create policy "recipe_ingredients_owner_write" on public.recipe_ingredients for all
  using (exists (select 1 from public.recipes r where r.id = recipe_id and r.owner_id = auth.uid()));

drop policy if exists "recipe_steps_read" on public.recipe_steps;
create policy "recipe_steps_read" on public.recipe_steps for select
  using (exists (select 1 from public.recipes r where r.id = recipe_id and (r.visibility = 'public' or r.owner_id = auth.uid())));
drop policy if exists "recipe_steps_owner_write" on public.recipe_steps;
create policy "recipe_steps_owner_write" on public.recipe_steps for all
  using (exists (select 1 from public.recipes r where r.id = recipe_id and r.owner_id = auth.uid()));

drop policy if exists "ingredients_public_read" on public.ingredients;
create policy "ingredients_public_read" on public.ingredients for select using (true);

drop policy if exists "plans_public_read" on public.plans;
create policy "plans_public_read" on public.plans for select using (true);

drop policy if exists "subscriptions_owner_read" on public.subscriptions;
create policy "subscriptions_owner_read" on public.subscriptions for select using (auth.uid() = user_id);

drop policy if exists "courses_public_read" on public.courses;
create policy "courses_public_read" on public.courses for select using (published = true or auth.uid() = chef_id);
drop policy if exists "courses_chef_write" on public.courses;
create policy "courses_chef_write" on public.courses for all using (auth.uid() = chef_id);

drop policy if exists "lessons_read" on public.lessons;
create policy "lessons_read" on public.lessons for select
  using (exists (select 1 from public.courses c where c.id = course_id and (c.published = true or c.chef_id = auth.uid())));
drop policy if exists "lessons_chef_write" on public.lessons;
create policy "lessons_chef_write" on public.lessons for all
  using (exists (select 1 from public.courses c where c.id = course_id and c.chef_id = auth.uid()));

drop policy if exists "enrollments_owner_all" on public.enrollments;
create policy "enrollments_owner_all" on public.enrollments for all using (auth.uid() = user_id);

drop policy if exists "lesson_progress_owner" on public.lesson_progress;
create policy "lesson_progress_owner" on public.lesson_progress for all
  using (exists (select 1 from public.enrollments e where e.id = enrollment_id and e.user_id = auth.uid()));

drop policy if exists "quizzes_read" on public.quizzes;
create policy "quizzes_read" on public.quizzes for select
  using (exists (select 1 from public.courses c where c.id = course_id and (c.published = true or c.chef_id = auth.uid())));
drop policy if exists "quizzes_chef_write" on public.quizzes;
create policy "quizzes_chef_write" on public.quizzes for all
  using (exists (select 1 from public.courses c where c.id = course_id and c.chef_id = auth.uid()));

drop policy if exists "quiz_attempts_owner" on public.quiz_attempts;
create policy "quiz_attempts_owner" on public.quiz_attempts for all using (auth.uid() = user_id);

drop policy if exists "waste_items_owner" on public.waste_items;
create policy "waste_items_owner" on public.waste_items for all using (auth.uid() = user_id);
drop policy if exists "waste_suggestions_owner" on public.waste_suggestions;
create policy "waste_suggestions_owner" on public.waste_suggestions for all
  using (exists (select 1 from public.waste_items w where w.id = waste_item_id and w.user_id = auth.uid()));

drop policy if exists "crm_activities_chef_owner" on public.crm_activities;
create policy "crm_activities_chef_owner" on public.crm_activities for all
  using (exists (select 1 from public.leads l where l.id = lead_id and l.chef_id = auth.uid()));

drop policy if exists "audit_logs_admin_read" on public.audit_logs;
create policy "audit_logs_admin_read" on public.audit_logs for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ---------- SEED (piani base) ----------
insert into public.plans (code, name, price_monthly, price_yearly, features)
values
  ('home_free', 'N''sK Home Free', 0, 0, '{"recipes": true, "meal_planner": false}'::jsonb),
  ('home_premium', 'N''sK Home Premium', 6.99, 69.90, '{"recipes": true, "meal_planner": true, "zero_waste": true, "tutor_ai": true}'::jsonb),
  ('pro_starter', 'N''sK Pro Starter', 29, 290, '{"food_cost": true, "crm": "basic", "analytics": "basic"}'::jsonb),
  ('pro_growth', 'N''sK Pro Growth', 79, 790, '{"food_cost": true, "haccp": true, "crm": "full", "analytics": "full", "academy_pro": true}'::jsonb)
on conflict (code) do nothing;
