-- Meses já pagos a cada produtor (marcados pelo admin)
create table if not exists public.producer_payments (
  id_producer uuid not null references public.producers(id_producer) on delete cascade,
  month text not null check (month ~ '^\d{4}-(0[1-9]|1[0-2])$'), -- "YYYY-MM"
  paid_at timestamptz not null default now(),
  primary key (id_producer, month)
);

alter table public.producer_payments disable row level security;
