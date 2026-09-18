-- 1. Perfil público do utilizador (extensão de auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text not null default 'client' check (role in ('client', 'producer', 'admin')),
  created_at timestamptz not null default now()
);

-- 2. Trigger para criar perfil automaticamente no registo
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id, 
    new.raw_user_meta_data->>'name'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Produtoras
create table if not exists public.producers (
  id_producer uuid primary key default gen_random_uuid(),
  id_user uuid not null references public.profiles(id) on delete cascade,
  company_name text not null,
  payout_info jsonb,
  created_at timestamptz not null default now()
);

-- 4. Filmes
create table if not exists public.films (
  id_film uuid primary key default gen_random_uuid(),
  id_producer uuid not null references public.producers(id_producer) on delete cascade,
  title text not null,
  slug text,
  year integer,
  category text,
  duration text,
  image text,
  description text,
  long_description text,
  price numeric(10,2) not null,
  video_url text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- 5. Compras
create table if not exists public.purchases (
  id_purchase uuid primary key default gen_random_uuid(),
  id_user uuid not null references public.profiles(id) on delete restrict,
  id_film uuid not null references public.films(id_film) on delete restrict,
  price_paid numeric(10,2) not null,
  purchased_at timestamptz not null default now()
);

-- Desativar RLS para desenvolvimento
alter table public.profiles disable row level security;
alter table public.producers disable row level security;
alter table public.films disable row level security;
alter table public.purchases disable row level security;

