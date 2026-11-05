create type public.app_role as enum ('super_admin','admin','event_manager','moderator');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id)
$$;

alter table public.user_roles enable row level security;
create policy "own roles select" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "super admin manages roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'super_admin')) with check (public.has_role(auth.uid(),'super_admin'));

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  wilaya int,
  commune text,
  xp int not null default 0,
  points int not null default 0,
  hours numeric not null default 0,
  status text not null default 'active',
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own or admin select" on public.profiles for select to authenticated using (auth.uid() = id or public.is_admin(auth.uid()));
create policy "own insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "admin update" on public.profiles for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create table public.categories (
  key text primary key,
  emoji text not null default '📌',
  name_ar text not null,
  name_fr text not null default '',
  name_en text not null default ''
);
grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "public read categories" on public.categories for select to anon, authenticated using (true);
create policy "admin write categories" on public.categories for all to authenticated using (public.has_role(auth.uid(),'super_admin') or public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'super_admin') or public.has_role(auth.uid(),'admin'));

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title_ar text not null,
  title_fr text not null default '',
  title_en text not null default '',
  desc_ar text not null default '',
  desc_fr text not null default '',
  desc_en text not null default '',
  cover_url text,
  category text references public.categories(key) on delete set null,
  wilaya int not null,
  commune text not null default '',
  address text not null default '',
  maps_url text,
  start_at timestamptz,
  end_at timestamptz,
  deadline timestamptz,
  capacity int not null default 50,
  xp int not null default 100,
  points int not null default 50,
  hours numeric not null default 2,
  organizer text not null default '',
  contact text not null default '',
  status text not null default 'draft',
  created_by uuid,
  created_at timestamptz not null default now()
);
grant select on public.events to anon, authenticated;
grant insert, update, delete on public.events to authenticated;
grant all on public.events to service_role;
alter table public.events enable row level security;
create policy "published events public" on public.events for select to anon, authenticated using (status = 'published' or public.is_admin(auth.uid()));
create policy "admin write events" on public.events for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "admin update events" on public.events for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admin delete events" on public.events for delete to authenticated using (public.has_role(auth.uid(),'super_admin') or public.has_role(auth.uid(),'admin'));

create table public.participations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);
grant select, insert, delete on public.participations to authenticated;
grant all on public.participations to service_role;
alter table public.participations enable row level security;
create policy "own or admin select" on public.participations for select to authenticated using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "own insert" on public.participations for insert to authenticated with check (auth.uid() = user_id);
create policy "own pending delete" on public.participations for delete to authenticated using (auth.uid() = user_id and status = 'pending');

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  participation_id uuid references public.participations(id) on delete set null,
  event_id uuid references public.events(id) on delete set null,
  user_id uuid not null,
  note text not null default '',
  media text[] not null default '{}',
  status text not null default 'pending',
  review_reason text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert on public.submissions to authenticated;
grant all on public.submissions to service_role;
alter table public.submissions enable row level security;
create policy "own or admin select" on public.submissions for select to authenticated using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "own insert" on public.submissions for insert to authenticated with check (auth.uid() = user_id);

create table public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  submission_id uuid unique references public.submissions(id) on delete set null,
  points int not null default 0,
  xp int not null default 0,
  hours numeric not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.points_ledger to authenticated;
grant all on public.points_ledger to service_role;
alter table public.points_ledger enable row level security;
create policy "own or admin select ledger" on public.points_ledger for select to authenticated using (auth.uid() = user_id or public.is_admin(auth.uid()));

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  body text not null default '',
  kind text not null default 'general',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, update on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "own select notifications" on public.notifications for select to authenticated using (auth.uid() = user_id);
create policy "own mark read" on public.notifications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  cost int not null default 100,
  stock int not null default 10,
  emoji text not null default '🎁',
  partner text not null default '',
  active boolean not null default true
);
grant select on public.rewards to anon, authenticated;
grant all on public.rewards to service_role;
alter table public.rewards enable row level security;
create policy "public read rewards" on public.rewards for select to anon, authenticated using (active or public.is_admin(auth.uid()));
create policy "admin write rewards" on public.rewards for all to authenticated using (public.has_role(auth.uid(),'super_admin') or public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'super_admin') or public.has_role(auth.uid(),'admin'));

create table public.redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  reward_id uuid references public.rewards(id) on delete set null,
  cost int not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
grant select, insert on public.redemptions to authenticated;
grant all on public.redemptions to service_role;
alter table public.redemptions enable row level security;
create policy "own or admin select redemptions" on public.redemptions for select to authenticated using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "own insert redemptions" on public.redemptions for insert to authenticated with check (auth.uid() = user_id);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null,
  action text not null,
  entity text not null default '',
  entity_id text not null default '',
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);
grant select on public.audit_log to authenticated;
grant all on public.audit_log to service_role;
alter table public.audit_log enable row level security;
create policy "admin read audit" on public.audit_log for select to authenticated using (public.is_admin(auth.uid()));