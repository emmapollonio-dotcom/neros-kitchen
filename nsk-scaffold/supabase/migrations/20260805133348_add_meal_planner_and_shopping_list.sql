create table public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Piano settimanale',
  week_start_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start_date)
);

create table public.meal_plan_entries (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references public.meal_plans(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  day_date date not null,
  meal_slot text not null default 'dinner' check (meal_slot in ('breakfast','lunch','dinner','snack')),
  servings integer not null default 2 check (servings > 0),
  notes text,
  created_at timestamptz not null default now()
);

create index meal_plan_entries_meal_plan_id_idx on public.meal_plan_entries (meal_plan_id);
create index meal_plan_entries_day_date_idx on public.meal_plan_entries (day_date);

create table public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  meal_plan_id uuid references public.meal_plans(id) on delete set null,
  title text not null default 'Lista della spesa',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  shopping_list_id uuid not null references public.shopping_lists(id) on delete cascade,
  ingredient_id uuid references public.ingredients(id) on delete set null,
  custom_label text,
  quantity numeric,
  unit text,
  category text,
  is_checked boolean not null default false,
  source text not null default 'manual' check (source in ('manual', 'meal_plan')),
  created_at timestamptz not null default now(),
  constraint shopping_list_items_label_check check (ingredient_id is not null or custom_label is not null)
);

create index shopping_list_items_shopping_list_id_idx on public.shopping_list_items (shopping_list_id);

alter table public.meal_plans enable row level security;
alter table public.meal_plan_entries enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_list_items enable row level security;

create policy meal_plans_owner on public.meal_plans
  for all using (auth.uid() = user_id);

create policy meal_plan_entries_owner on public.meal_plan_entries
  for all using (
    exists (
      select 1 from public.meal_plans mp
      where mp.id = meal_plan_entries.meal_plan_id and mp.user_id = auth.uid()
    )
  );

create policy shopping_lists_owner on public.shopping_lists
  for all using (auth.uid() = user_id);

create policy shopping_list_items_owner on public.shopping_list_items
  for all using (
    exists (
      select 1 from public.shopping_lists sl
      where sl.id = shopping_list_items.shopping_list_id and sl.user_id = auth.uid()
    )
  );
