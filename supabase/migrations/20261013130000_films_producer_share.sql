-- Percentagem acordada com o produtor (0–100), definida pelo admin
alter table public.films
  add column if not exists producer_share numeric(5,2)
  check (producer_share is null or (producer_share >= 0 and producer_share <= 100));
