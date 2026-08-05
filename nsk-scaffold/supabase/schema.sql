-- =========================================================
-- NERO'S KITCHEN (N'sK) — SUPABASE / POSTGRESQL SCHEMA
-- Eseguibile end-to-end su un progetto Supabase vuoto.
-- Uso: supabase db push  oppure incolla in SQL Editor.
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

-- Assente dalla definizione originale: senza un indice unique, il seed più
-- sotto non ha un target per "on conflict" e ogni re-run duplicherebbe le
-- righe. Case-insensitive perché il catalogo è inserito/curato a mano.
create unique index if not exists ingredients_name_lower_idx on public.ingredients (lower(name));

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
  reason text,
  image_url text,
  logged_at timestamptz not null default now()
);

-- Colonna aggiunta con lo Zero Waste AI module (Sprint 6): idempotente così
-- non rompe schema.sql su un progetto Supabase dove waste_items esiste già
-- senza questa colonna (vedi nota in DEPLOY-ISTRUZIONI.md).
alter table public.waste_items add column if not exists reason text;

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

-- ---------- HACCP ----------
create table if not exists public.haccp_control_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  type text not null, -- frigo | freezer | cella | banco_caldo | altro
  temp_min numeric(5,2) not null,
  temp_max numeric(5,2) not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.haccp_readings (
  id uuid primary key default gen_random_uuid(),
  control_point_id uuid not null references public.haccp_control_points(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  temperature numeric(5,2) not null,
  is_non_conforming boolean not null default false,
  note text,
  recorded_at timestamptz not null default now()
);

create table if not exists public.haccp_corrective_actions (
  id uuid primary key default gen_random_uuid(),
  reading_id uuid not null references public.haccp_readings(id) on delete cascade,
  title text not null,
  content text,
  urgency text, -- bassa | media | alta
  ai_log_id uuid,
  created_at timestamptz not null default now()
);

-- ---------- SOCIAL MEDIA STUDIO ----------
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  topic text not null,
  tone text,
  caption text,
  hashtags text[] default '{}',
  status text not null default 'draft', -- draft | ready | scheduled | published
  scheduled_at timestamptz,
  ai_log_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
-- security_invoker = true è OBBLIGATORIO: senza, la view gira con i permessi di chi
-- l'ha creata (bypassando la RLS di chi interroga). Su v_booking_revenue in particolare,
-- senza questo flag qualunque utente autenticato vedrebbe il fatturato di TUTTI gli chef,
-- non solo del proprio — trovato dal Supabase security advisor, non dal linter statico.
create or replace view public.v_chef_public_profile
  with (security_invoker = true) as
  select c.id, p.full_name, c.business_name, c.bio, c.specialties, c.languages,
         c.rating_avg, c.rating_count, c.verified, c.hourly_rate, c.event_min_price
  from public.chefs c join public.profiles p on p.id = c.id
  where c.verified = true;

create or replace view public.v_booking_revenue
  with (security_invoker = true) as
  select b.chef_id, date_trunc('month', b.event_date) as month,
         count(*) as bookings_count, sum(pay.amount) as revenue
  from public.bookings b
  join public.payments pay on pay.booking_id = b.id and pay.status = 'paid'
  where b.status = 'completed'
  group by b.chef_id, date_trunc('month', b.event_date);

-- ---------- TRIGGERS ----------

-- Crea automaticamente la riga public.profiles quando un utente si registra via Supabase Auth
-- (email/password o OAuth). Senza questo trigger, auth.users e public.profiles divergono e
-- ogni query che fa join con profiles per un utente appena creato fallisce silenziosamente.
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
returns trigger language plpgsql security invoker set search_path = public as $$
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

-- security definer necessario: il trigger scatta quando un CUSTOMER lascia una recensione,
-- ma la UPDATE su chefs è filtrata da RLS a "solo lo chef stesso" (chefs_self_write).
-- Senza definer l'update aggiorna 0 righe in silenzio e il rating non si aggiorna mai —
-- bug reale trovato dal Supabase security advisor dopo il primo deploy.
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

drop trigger if exists trg_review_update_rating on public.reviews;
create trigger trg_review_update_rating after insert on public.reviews
  for each row execute function public.update_chef_rating();

-- security definer necessario: il trigger su bookings/payments scatta durante l'INSERT/UPDATE
-- fatto da un customer o chef normale, ma audit_logs non ha policy insert per utenti non-admin.
-- Senza definer, ogni creazione/modifica di una prenotazione fallirebbe con RLS violation —
-- bug reale trovato dal Supabase security advisor dopo il primo deploy, non dal linter statico.
create or replace function public.log_audit()
returns trigger language plpgsql security definer set search_path = public as $$
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

-- Fix Sprint 7: la versione precedente di questa policy faceva
-- "exists (select 1 from public.profiles p where ...)" dentro alla policy
-- di SELECT su public.profiles stessa — ogni riga letta rivalutava la
-- policy su se stessa, causando "infinite recursion detected in policy
-- for relation profiles" (42P17) a qualunque client con RLS attivo
-- (incluse le Edge Function con JWT utente, non solo l'app web). Il fix
-- standard Supabase è isolare il controllo admin in una funzione
-- SECURITY DEFINER: gira coi privilegi del proprietario (bypassa RLS
-- nella query interna), quindi non rientra nella policy che la chiama.
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'::user_role);
$$;

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles for select
  using (auth.uid() = id or public.is_admin());

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

-- Il customer può creare la propria riga di pagamento in stato 'pending' quando avvia
-- il checkout (vedi app/api/v1/bookings/[id]/pay/route.ts). La transizione a 'paid' è
-- riservata al webhook Stripe via service role (bypassa RLS) — nessuna policy update
-- per utenti normali: un utente non può auto-confermarsi un pagamento come riuscito.
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

-- ---------- RLS — tabelle aggiunte in fase di verifica (script scripts/verify_schema.py) ----------
-- Nota: senza RLS abilitata, PostgREST/Supabase espone queste tabelle in lettura/scrittura
-- a chiunque abbia la anon key. Ogni tabella con dati per-utente o sensibili deve averla.

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
alter table public.social_posts enable row level security;
alter table public.haccp_control_points enable row level security;
alter table public.haccp_readings enable row level security;
alter table public.haccp_corrective_actions enable row level security;

-- chef_availability: pubblica in lettura (serve per mostrare gli slot in booking UI), scrivibile solo dallo chef proprietario
drop policy if exists "availability_public_read" on public.chef_availability;
create policy "availability_public_read" on public.chef_availability for select using (true);
drop policy if exists "availability_chef_write" on public.chef_availability;
create policy "availability_chef_write" on public.chef_availability for all using (auth.uid() = chef_id);

-- recipe_ingredients / recipe_steps: seguono la visibilità/ownership della ricetta padre
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

-- ingredients: catalogo di riferimento, lettura pubblica; scrittura riservata a service role (admin/import)
drop policy if exists "ingredients_public_read" on public.ingredients;
create policy "ingredients_public_read" on public.ingredients for select using (true);

-- Catalogo condiviso (nessun owner_id): qualunque chef/admin può curarlo,
-- non solo chi lo ha creato. Il sub-select su profiles è sicuro (non è
-- ricorsivo: la policy vive su ingredients, non su profiles stessa — vedi
-- il fix di profiles_self_read più sotto per il caso che invece lo era).
drop policy if exists "ingredients_chef_write" on public.ingredients;
create policy "ingredients_chef_write" on public.ingredients for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and (role = 'chef'::user_role or role = 'admin'::user_role)
  ))
  with check (exists (
    select 1 from public.profiles
    where id = auth.uid() and (role = 'chef'::user_role or role = 'admin'::user_role)
  ));

-- plans: catalogo pubblico dei piani di abbonamento
drop policy if exists "plans_public_read" on public.plans;
create policy "plans_public_read" on public.plans for select using (true);

-- subscriptions: solo l'utente titolare può leggere la propria; scrittura solo via service role (webhook Stripe/n8n)
drop policy if exists "subscriptions_owner_read" on public.subscriptions;
create policy "subscriptions_owner_read" on public.subscriptions for select using (auth.uid() = user_id);

-- courses: pubblici se published, sempre visibili/gestibili dallo chef proprietario
drop policy if exists "courses_public_read" on public.courses;
create policy "courses_public_read" on public.courses for select using (published = true or auth.uid() = chef_id);
drop policy if exists "courses_chef_write" on public.courses;
create policy "courses_chef_write" on public.courses for all using (auth.uid() = chef_id);

-- lessons: leggibili se il corso è pubblico o l'utente ne è proprietario; scrivibili solo dal chef del corso
drop policy if exists "lessons_read" on public.lessons;
create policy "lessons_read" on public.lessons for select
  using (exists (select 1 from public.courses c where c.id = course_id and (c.published = true or c.chef_id = auth.uid())));
drop policy if exists "lessons_chef_write" on public.lessons;
create policy "lessons_chef_write" on public.lessons for all
  using (exists (select 1 from public.courses c where c.id = course_id and c.chef_id = auth.uid()));

-- enrollments: solo l'utente iscritto vede/gestisce la propria iscrizione
drop policy if exists "enrollments_owner_all" on public.enrollments;
create policy "enrollments_owner_all" on public.enrollments for all using (auth.uid() = user_id);

-- lesson_progress: accessibile solo tramite la propria enrollment
drop policy if exists "lesson_progress_owner" on public.lesson_progress;
create policy "lesson_progress_owner" on public.lesson_progress for all
  using (exists (select 1 from public.enrollments e where e.id = enrollment_id and e.user_id = auth.uid()));

-- quizzes: leggibili secondo le stesse regole delle lezioni del corso
drop policy if exists "quizzes_read" on public.quizzes;
create policy "quizzes_read" on public.quizzes for select
  using (exists (select 1 from public.courses c where c.id = course_id and (c.published = true or c.chef_id = auth.uid())));
drop policy if exists "quizzes_chef_write" on public.quizzes;
create policy "quizzes_chef_write" on public.quizzes for all
  using (exists (select 1 from public.courses c where c.id = course_id and c.chef_id = auth.uid()));

-- quiz_attempts: solo l'utente che ha svolto il tentativo
drop policy if exists "quiz_attempts_owner" on public.quiz_attempts;
create policy "quiz_attempts_owner" on public.quiz_attempts for all using (auth.uid() = user_id);

-- waste_items / waste_suggestions: dati personali zero-waste, solo il proprietario
drop policy if exists "waste_items_owner" on public.waste_items;
create policy "waste_items_owner" on public.waste_items for all using (auth.uid() = user_id);
drop policy if exists "waste_suggestions_owner" on public.waste_suggestions;
create policy "waste_suggestions_owner" on public.waste_suggestions for all
  using (exists (select 1 from public.waste_items w where w.id = waste_item_id and w.user_id = auth.uid()));

-- haccp_*: registri sicurezza alimentare, solo il proprietario (chef)
drop policy if exists "haccp_control_points_owner" on public.haccp_control_points;
create policy "haccp_control_points_owner" on public.haccp_control_points for all
  using (auth.uid() = user_id);
drop policy if exists "haccp_readings_owner" on public.haccp_readings;
create policy "haccp_readings_owner" on public.haccp_readings for all
  using (auth.uid() = user_id);
drop policy if exists "haccp_corrective_actions_owner" on public.haccp_corrective_actions;
create policy "haccp_corrective_actions_owner" on public.haccp_corrective_actions for all
  using (exists (
    select 1 from public.haccp_readings r
    where r.id = reading_id and r.user_id = auth.uid()
  ));

-- social_posts: dati marketing personali, solo il proprietario (chef)
drop policy if exists "social_posts_owner" on public.social_posts;
create policy "social_posts_owner" on public.social_posts for all using (auth.uid() = user_id);

-- crm_activities: solo lo chef titolare del lead collegato
drop policy if exists "crm_activities_chef_owner" on public.crm_activities;
create policy "crm_activities_chef_owner" on public.crm_activities for all
  using (exists (select 1 from public.leads l where l.id = lead_id and l.chef_id = auth.uid()));

-- audit_logs: solo Admin (nessun accesso utente standard)
drop policy if exists "audit_logs_admin_read" on public.audit_logs;
create policy "audit_logs_admin_read" on public.audit_logs for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Queste 3 funzioni sono trigger interni (security definer), non endpoint da chiamare via
-- API: senza questa revoke, Supabase le espone comunque su /rest/v1/rpc/<nome> a chiunque.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.log_audit() from public, anon, authenticated;
revoke execute on function public.update_chef_rating() from public, anon, authenticated;

-- ---------- SEED (piani base) ----------
insert into public.plans (code, name, price_monthly, price_yearly, features)
values
  ('home_free', 'N''sK Home Free', 0, 0, '{"recipes": true, "meal_planner": false}'::jsonb),
  ('home_premium', 'N''sK Home Premium', 6.99, 69.90, '{"recipes": true, "meal_planner": true, "zero_waste": true, "tutor_ai": true}'::jsonb),
  ('pro_starter', 'N''sK Pro Starter', 29, 290, '{"food_cost": true, "crm": "basic", "analytics": "basic"}'::jsonb),
  ('pro_growth', 'N''sK Pro Growth', 79, 790, '{"food_cost": true, "haccp": true, "crm": "full", "analytics": "full", "academy_pro": true, "social_studio": true}'::jsonb)
on conflict (code) do nothing;

-- Il piano pro_growth potrebbe già esistere da un seed precedente (senza
-- social_studio nelle features, aggiunto con lo Social Media Studio module):
-- l'insert sopra con "on conflict do nothing" in quel caso non lo aggiorna,
-- serve un merge esplicito e idempotente.
update public.plans
set features = features || '{"social_studio": true}'::jsonb
where code = 'pro_growth';

-- Idem per haccp: già nel valore INSERT originale, ma il merge esplicito
-- lo rende sicuro anche se il seed iniziale sul progetto reale fosse
-- avvenuto prima che questa chiave fosse aggiunta allo scaffold.
update public.plans
set features = features || '{"haccp": true}'::jsonb
where code = 'pro_growth';

-- ---------- SEED (catalogo ingredienti base) ----------
-- Prezzi medi di mercato italiano indicativi (2026), NON i costi reali dei
-- tuoi fornitori: servono a sbloccare Food Cost e Zero Waste con dati
-- plausibili da subito. Vanno verificati e corretti con le fatture vere —
-- correggibili poi dalla UI /ingredienti (policy "ingredients_chef_write").
insert into public.ingredients (name, category, default_unit, avg_cost_per_unit, allergens, is_scrap_reusable)
values
  ('Pollo (petto)', 'Carne', 'kg', 8.50, '{}', false),
  ('Pollo (intero)', 'Carne', 'kg', 4.50, '{}', false),
  ('Manzo (controfiletto)', 'Carne', 'kg', 22.00, '{}', false),
  ('Manzo (macinato)', 'Carne', 'kg', 11.00, '{}', false),
  ('Maiale (lonza)', 'Carne', 'kg', 9.50, '{}', false),
  ('Vitello (scaloppine)', 'Carne', 'kg', 24.00, '{}', false),
  ('Agnello (cosciotto)', 'Carne', 'kg', 16.00, '{}', false),
  ('Guanciale', 'Carne', 'kg', 18.00, '{}', false),
  ('Pancetta', 'Carne', 'kg', 10.00, '{}', false),
  ('Branzino (intero)', 'Pesce', 'kg', 14.00, '{pesce}', false),
  ('Salmone (filetto)', 'Pesce', 'kg', 21.00, '{pesce}', false),
  ('Gamberi', 'Pesce', 'kg', 26.00, '{crostacei}', false),
  ('Cozze', 'Pesce', 'kg', 5.50, '{molluschi}', false),
  ('Tonno (filetto)', 'Pesce', 'kg', 28.00, '{pesce}', false),
  ('Baccalà', 'Pesce', 'kg', 15.00, '{pesce}', false),
  ('Pomodori', 'Verdure', 'kg', 2.20, '{}', true),
  ('Cipolle', 'Verdure', 'kg', 1.10, '{}', true),
  ('Carote', 'Verdure', 'kg', 1.30, '{}', true),
  ('Sedano', 'Verdure', 'kg', 1.50, '{sedano}', true),
  ('Patate', 'Verdure', 'kg', 1.00, '{}', true),
  ('Zucchine', 'Verdure', 'kg', 2.00, '{}', true),
  ('Melanzane', 'Verdure', 'kg', 2.30, '{}', true),
  ('Peperoni', 'Verdure', 'kg', 3.00, '{}', true),
  ('Spinaci', 'Verdure', 'kg', 3.50, '{}', true),
  ('Funghi porcini', 'Verdure', 'kg', 25.00, '{}', true),
  ('Funghi champignon', 'Verdure', 'kg', 4.50, '{}', true),
  ('Aglio', 'Verdure', 'kg', 5.00, '{}', true),
  ('Basilico', 'Erbe', 'mazzo', 1.50, '{}', true),
  ('Prezzemolo', 'Erbe', 'mazzo', 1.20, '{}', true),
  ('Rosmarino', 'Erbe', 'mazzo', 1.20, '{}', true),
  ('Limoni', 'Frutta', 'kg', 2.50, '{}', true),
  ('Arance', 'Frutta', 'kg', 2.00, '{}', true),
  ('Mele', 'Frutta', 'kg', 2.20, '{}', true),
  ('Zafferano', 'Spezie', 'g', 15.00, '{}', false),
  ('Burro', 'Latticini', 'kg', 8.00, '{lattosio}', false),
  ('Panna fresca', 'Latticini', 'L', 5.50, '{lattosio}', false),
  ('Parmigiano Reggiano', 'Latticini', 'kg', 16.00, '{lattosio}', false),
  ('Mozzarella di bufala', 'Latticini', 'kg', 12.00, '{lattosio}', false),
  ('Ricotta', 'Latticini', 'kg', 6.50, '{lattosio}', false),
  ('Latte', 'Latticini', 'L', 1.30, '{lattosio}', false),
  ('Uova', 'Uova', 'pz', 0.35, '{uova}', false),
  ('Farina 00', 'Cereali', 'kg', 1.20, '{glutine}', false),
  ('Farina di semola', 'Cereali', 'kg', 1.50, '{glutine}', false),
  ('Riso Carnaroli', 'Cereali', 'kg', 3.80, '{}', false),
  ('Pasta secca', 'Cereali', 'kg', 2.20, '{glutine}', false),
  ('Pane', 'Cereali', 'kg', 3.50, '{glutine}', true),
  ('Olio extravergine di oliva', 'Condimenti', 'L', 9.50, '{}', false),
  ('Aceto balsamico', 'Condimenti', 'L', 12.00, '{}', false),
  ('Sale', 'Condimenti', 'kg', 1.00, '{}', false),
  ('Pepe nero', 'Condimenti', 'kg', 25.00, '{}', false),
  ('Zucchero', 'Condimenti', 'kg', 1.50, '{}', false),
  ('Vino bianco da cucina', 'Condimenti', 'L', 4.50, '{solfiti}', false)
on conflict (lower(name)) do nothing;

-- ---------- 4 agenti AI aggiuntivi (crm_lead_qualifier, academy_tutor,
-- review_responder, allergen_advisor) — colonne e policy mancanti sulle
-- tabelle esistenti (nessuna nuova tabella: riusano CRM/Academy/Reviews/
-- Recipes già presenti nello schema).

-- crm_lead_qualifier: nessuna colonna nuova, scrive su leads.score
-- (già scrivibile via "leads_chef_owner") e su crm_activities con
-- type = 'ai_suggestion' (colonna text, nessun check constraint da aggiornare).

-- academy_tutor: serve conoscere le risposte dell'allievo per spiegare gli
-- errori (prima non venivano persistite, solo punteggio/esito), e una
-- colonna dove salvare il feedback generato.
alter table public.quiz_attempts add column if not exists answers jsonb;
alter table public.quiz_attempts add column if not exists ai_feedback text;

-- review_responder: reviews non aveva né una colonna risposta né una policy
-- di update (solo insert del recensore) — lo chef non poteva scrivere nulla.
alter table public.reviews add column if not exists chef_response text;
alter table public.reviews add column if not exists chef_response_at timestamptz;

drop policy if exists "reviews_chef_respond" on public.reviews;
create policy "reviews_chef_respond" on public.reviews for update
  using (auth.uid() = chef_id)
  with check (auth.uid() = chef_id);

-- allergen_advisor: recipes.allergens esiste già (usato dal form ricetta),
-- serve solo un campo testuale per le note (avvertenze contaminazione
-- incrociata, suggerimenti di variante) che l'agente genera insieme
-- all'elenco allergeni.
alter table public.recipes add column if not exists allergen_notes text;
