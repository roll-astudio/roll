-- 30% por omissão para a percentagem do produtor; preenche os filmes existentes
alter table public.films alter column producer_share set default 30;

update public.films set producer_share = 30 where producer_share is null;

alter table public.films alter column producer_share set not null;
