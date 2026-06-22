-- ============================================================
-- LIHUEL APP — Supabase Schema Migration 001
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  role text not null check (role in ('maestro', 'supervisor', 'gerencia')),
  avatar_url text,
  push_subscription jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view all profiles"
  on public.profiles for select using (auth.role() = 'authenticated');

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- ============================================================
-- OBRAS (Projects)
-- ============================================================
create table public.obras (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  location text not null,
  start_date date not null,
  estimated_end_date date not null,
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.obras enable row level security;

create policy "Authenticated users can view obras"
  on public.obras for select using (auth.role() = 'authenticated');

create policy "Gerencia can insert obras"
  on public.obras for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'gerencia')
  );

create policy "Gerencia can update obras"
  on public.obras for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'gerencia')
  );

-- ============================================================
-- OBRA ASSIGNMENTS (many-to-many: users <-> obras)
-- ============================================================
create table public.obra_assignments (
  id uuid default uuid_generate_v4() primary key,
  obra_id uuid references public.obras(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('maestro', 'supervisor')),
  created_at timestamptz default now(),
  unique(obra_id, user_id)
);

alter table public.obra_assignments enable row level security;

create policy "Authenticated users can view assignments"
  on public.obra_assignments for select using (auth.role() = 'authenticated');

create policy "Gerencia can manage assignments"
  on public.obra_assignments for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'gerencia')
  );

-- ============================================================
-- CHECKLIST TEMPLATES (global, per stage type)
-- ============================================================
create table public.checklist_templates (
  id uuid default uuid_generate_v4() primary key,
  stage_type text not null check (stage_type in (
    'obra_gruesa',
    'instalaciones_electricas',
    'instalaciones_sanitarias',
    'terminaciones',
    'paisajismo_exteriores',
    'inspeccion_final'
  )),
  description text not null,
  order_index integer not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.checklist_templates enable row level security;

create policy "Authenticated users can view templates"
  on public.checklist_templates for select using (auth.role() = 'authenticated');

create policy "Gerencia can manage templates"
  on public.checklist_templates for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'gerencia')
  );

-- ============================================================
-- STAGES (one per stage type per obra)
-- ============================================================
create table public.stages (
  id uuid default uuid_generate_v4() primary key,
  obra_id uuid references public.obras(id) on delete cascade not null,
  stage_type text not null check (stage_type in (
    'obra_gruesa',
    'instalaciones_electricas',
    'instalaciones_sanitarias',
    'terminaciones',
    'paisajismo_exteriores',
    'inspeccion_final'
  )),
  status text not null default 'pending' check (status in ('pending', 'in_review', 'approved', 'rejected')),
  observations text,
  rejection_comment text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  submitted_by uuid references public.profiles(id),
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(obra_id, stage_type)
);

alter table public.stages enable row level security;

create policy "Authenticated users can view stages"
  on public.stages for select using (auth.role() = 'authenticated');

create policy "Maestros can update assigned stages"
  on public.stages for update using (
    exists (
      select 1 from public.obra_assignments oa
      where oa.obra_id = stages.obra_id
        and oa.user_id = auth.uid()
        and oa.role = 'maestro'
    )
    or exists (select 1 from public.profiles where id = auth.uid() and role in ('supervisor', 'gerencia'))
  );

-- ============================================================
-- CHECKLIST ITEMS (instance per stage, copied from template)
-- ============================================================
create table public.checklist_items (
  id uuid default uuid_generate_v4() primary key,
  stage_id uuid references public.stages(id) on delete cascade not null,
  template_id uuid references public.checklist_templates(id),
  description text not null,
  status text not null default 'not_done' check (status in ('done', 'not_done')),
  order_index integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.checklist_items enable row level security;

create policy "Authenticated users can view checklist items"
  on public.checklist_items for select using (auth.role() = 'authenticated');

create policy "Maestros can update checklist items"
  on public.checklist_items for update using (
    exists (
      select 1 from public.stages s
      join public.obra_assignments oa on oa.obra_id = s.obra_id
      where s.id = checklist_items.stage_id
        and oa.user_id = auth.uid()
    )
    or exists (select 1 from public.profiles where id = auth.uid() and role in ('supervisor', 'gerencia'))
  );

-- ============================================================
-- STAGE PHOTOS
-- ============================================================
create table public.stage_photos (
  id uuid default uuid_generate_v4() primary key,
  stage_id uuid references public.stages(id) on delete cascade not null,
  storage_path text not null,
  public_url text not null,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.stage_photos enable row level security;

create policy "Authenticated users can view photos"
  on public.stage_photos for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert photos"
  on public.stage_photos for insert with check (auth.role() = 'authenticated');

create policy "Uploader or gerencia can delete photos"
  on public.stage_photos for delete using (
    uploaded_by = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'gerencia')
  );

-- ============================================================
-- INCIDENTS
-- ============================================================
create table public.incidents (
  id uuid default uuid_generate_v4() primary key,
  obra_id uuid references public.obras(id) on delete cascade not null,
  stage_id uuid references public.stages(id),
  title text not null,
  description text not null,
  severity text not null check (severity in ('low', 'medium', 'high')),
  status text not null default 'open' check (status in ('open', 'assigned', 'resolved')),
  assigned_to uuid references public.profiles(id),
  resolution_notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  resolved_at timestamptz,
  updated_at timestamptz default now()
);

alter table public.incidents enable row level security;

create policy "Supervisors and gerencia can view incidents"
  on public.incidents for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('supervisor', 'gerencia'))
  );

create policy "Supervisors and gerencia can manage incidents"
  on public.incidents for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('supervisor', 'gerencia'))
  );

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  body text not null,
  read boolean not null default false,
  related_obra_id uuid references public.obras(id),
  related_stage_id uuid references public.stages(id),
  related_incident_id uuid references public.incidents(id),
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Users can view own notifications"
  on public.notifications for select using (user_id = auth.uid());

create policy "Users can update own notifications"
  on public.notifications for update using (user_id = auth.uid());

create policy "System can insert notifications"
  on public.notifications for insert with check (auth.role() = 'authenticated');

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'maestro')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-create stages when obra is created
create or replace function public.create_obra_stages()
returns trigger language plpgsql security definer as $$
begin
  insert into public.stages (obra_id, stage_type)
  values
    (new.id, 'obra_gruesa'),
    (new.id, 'instalaciones_electricas'),
    (new.id, 'instalaciones_sanitarias'),
    (new.id, 'terminaciones'),
    (new.id, 'paisajismo_exteriores'),
    (new.id, 'inspeccion_final');
  return new;
end;
$$;

create trigger on_obra_created
  after insert on public.obras
  for each row execute procedure public.create_obra_stages();

-- Auto-populate checklist items when stage is created (from templates)
create or replace function public.populate_stage_checklist()
returns trigger language plpgsql security definer as $$
begin
  insert into public.checklist_items (stage_id, template_id, description, order_index)
  select new.id, ct.id, ct.description, ct.order_index
  from public.checklist_templates ct
  where ct.stage_type = new.stage_type;
  return new;
end;
$$;

create trigger on_stage_created
  after insert on public.stages
  for each row execute procedure public.populate_stage_checklist();

-- Update updated_at automatically
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger obras_updated_at before update on public.obras
  for each row execute procedure public.update_updated_at();
create trigger stages_updated_at before update on public.stages
  for each row execute procedure public.update_updated_at();
create trigger checklist_items_updated_at before update on public.checklist_items
  for each row execute procedure public.update_updated_at();
create trigger incidents_updated_at before update on public.incidents
  for each row execute procedure public.update_updated_at();
create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at();
create trigger templates_updated_at before update on public.checklist_templates
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- REALTIME: enable on key tables
-- ============================================================
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.stages;
alter publication supabase_realtime add table public.incidents;

-- ============================================================
-- STORAGE: create bucket for photos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('stage-photos', 'stage-photos', true)
on conflict do nothing;

create policy "Authenticated users can upload photos"
  on storage.objects for insert
  with check (bucket_id = 'stage-photos' and auth.role() = 'authenticated');

create policy "Public read for photos"
  on storage.objects for select
  using (bucket_id = 'stage-photos');

create policy "Uploader can delete own photos"
  on storage.objects for delete
  using (bucket_id = 'stage-photos' and auth.uid()::text = (storage.foldername(name))[1]);
