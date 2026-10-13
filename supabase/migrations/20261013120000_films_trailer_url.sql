-- URL do trailer (YouTube), opcional
alter table public.films add column if not exists trailer_url text;
