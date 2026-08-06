-- Queste tabelle esistevano già in produzione (HACCP e Social Media Studio,
-- Sprint 6) ma erano state applicate via execute_sql diretto, non tramite
-- apply_migration: non comparivano in supabase_migrations.schema_migrations
-- e quindi mancavano da questa cronologia. Trovato allineando lo schema di
-- un ambiente di staging con quello di produzione (colonne verificate con
-- list_tables verbose sull'ambiente reale, non solo contro schema.sql, che
-- è un riferimento e può disallinearsi a sua volta). Registrata qui a
-- posteriori sia su staging sia su produzione: tutto idempotente
-- (if not exists / create or replace), nessun impatto sui dati esistenti.

alter table public.waste_items add column if not exists reason text;

create table if not exists public.haccp_control_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  type text not null,
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
  urgency text,
  ai_log_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  topic text not null,
  tone text,
  caption text,
  hashtags text[] default '{}',
  status text not null default 'draft',
  scheduled_at timestamptz,
  ai_log_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.social_posts enable row level security;
alter table public.haccp_control_points enable row level security;
alter table public.haccp_readings enable row level security;
alter table public.haccp_corrective_actions enable row level security;

drop policy if exists "social_posts_owner" on public.social_posts;
create policy "social_posts_owner" on public.social_posts for all using (auth.uid() = user_id);

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
