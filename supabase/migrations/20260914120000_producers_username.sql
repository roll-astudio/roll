-- Username público do produtor, usado em /produtor/[username]
alter table public.producers add column if not exists username text;

create unique index if not exists producers_username_key
  on public.producers (lower(username));
