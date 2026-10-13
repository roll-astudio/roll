-- A percentagem é a que a Roll recebe (o produtor recebe o resto)
alter table public.films rename column producer_share to roll_share;
