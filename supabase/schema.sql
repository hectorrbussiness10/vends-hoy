-- Vends Hoy — esquema completo.
-- Pegar en el SQL Editor de Supabase (proyecto nuevo o vacío).
-- RLS activo. Las claves secretas nunca salen al cliente.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  password_hash text not null,
  referral_code text not null unique,
  referred_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  sector text not null default 'tienda',
  content jsonb not null,
  initial_content jsonb not null,
  panel_password_hash text not null,
  must_change_password boolean not null default true,
  trial_ends_at timestamptz not null,
  plan text not null default 'trial' check (plan in ('trial', 'active', 'canceled', 'past_due')),
  stripe_customer_id text,
  stripe_subscription_id text,
  referral_code text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists sites_owner_id_idx on public.sites (owner_id);

create table if not exists public.site_versions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  label text not null,
  content jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists site_versions_site_id_idx on public.site_versions (site_id, created_at desc);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  service text,
  date text,
  time text,
  notes text,
  status text not null default 'nueva',
  created_at timestamptz not null default now()
);

create index if not exists bookings_site_id_idx on public.bookings (site_id, created_at desc);

create table if not exists public.prompt_events (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  prompt text not null,
  summary text,
  preview jsonb,
  applied boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists prompt_events_site_day_idx on public.prompt_events (site_id, created_at);

create table if not exists public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  invited_id uuid not null references public.profiles(id) on delete cascade,
  invited_site_id uuid references public.sites(id) on delete set null,
  amount_cents integer not null default 5000,
  status text not null default 'pending' check (status in ('pending', 'ready', 'applied', 'expired')),
  apply_on date,
  applied_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.sites enable row level security;
alter table public.site_versions enable row level security;
alter table public.bookings enable row level security;
alter table public.prompt_events enable row level security;
alter table public.referral_rewards enable row level security;

-- Lectura pública del contenido de una web publicada (sin hashes ni stripe).
create policy "sites_public_read"
  on public.sites for select
  to anon, authenticated
  using (true);

create policy "bookings_insert_public"
  on public.bookings for insert
  to anon, authenticated
  with check (true);

-- El resto de escrituras las hace el servidor con la service role (omite RLS).
-- No hay policies de update/delete para anon.

create or replace view public.site_public
  with (security_invoker = true)
  as
  select
    id,
    slug,
    sector,
    content,
    plan,
    trial_ends_at,
    created_at
  from public.sites;

grant select on public.site_public to anon, authenticated;

create table if not exists public.login_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create index if not exists login_events_created_at_idx on public.login_events (created_at desc);
create index if not exists login_events_profile_id_idx on public.login_events (profile_id);

alter table public.login_events enable row level security;
