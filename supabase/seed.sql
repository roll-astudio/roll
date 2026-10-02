-- 6. SEED DATA: Criar utilizador, perfil e produtora de teste
insert into auth.users (id, email) 
values ('00000000-0000-4000-8000-000000000001', 'produtor@teste.com')
on conflict do nothing;

insert into public.profiles (id, name, role)
values ('00000000-0000-4000-8000-000000000001', 'Produtora Geral', 'producer')
on conflict (id) do update
set name = excluded.name,
    role = excluded.role;

insert into public.producers (id_producer, id_user, company_name, username)
values ('11111111-1111-4111-8111-111111111111', '00000000-0000-4000-8000-000000000001', 'Produtora Geral', 'produtora-geral')
on conflict (id_producer) do update set username = excluded.username;

-- 7. SEED DATA: Inserção dos 7 filmes
insert into public.films (
  id_producer, title, slug, year, category, price, duration, image, description, long_description, is_published
) values 
  ('11111111-1111-4111-8111-111111111111', 'Entre Rios', 'entre-rios', 2023, 'Documentário', 12.90, '52 min', 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1800&q=90', 'As histórias que fluem entre duas margens e transformam destinos.', 'Entre Rios acompanha as pessoas e as memórias que vivem junto às águas. Um retrato íntimo de comunidades ligadas por uma paisagem em constante movimento, onde cada margem guarda uma história e cada travessia revela uma nova forma de pertença.', true),
  ('11111111-1111-4111-8111-111111111111', 'Casa de Dona Ilda', 'casa-de-dona-ilda', 2022, 'Documentário', 9.90, '46 min', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1800&q=90', 'Memórias de uma casa, de uma vida e de um bairro que mudou.', 'Uma casa pode ser um arquivo vivo. Dona Ilda abre as portas da sua memória para contar a história de um bairro, das pessoas que o construíram e das mudanças que transformaram o lugar que sempre chamou de seu.', true),
  ('11111111-1111-4111-8111-111111111111', 'No Fim do Horizonte', 'no-fim-do-horizonte', 2024, 'Documentário', 14.90, '1h 06min', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=90', 'Uma expedição sobre limites, coragem e descoberta.', 'Uma viagem aos lugares onde o caminho deixa de ser evidente. Entre montanhas, silêncio e esforço, este filme é um convite a avançar um pouco mais e a descobrir o que existe para lá dos nossos próprios limites.', true),
  ('11111111-1111-4111-8111-111111111111', 'Amazónia Viva', 'amazonia-viva', 2023, 'Natureza', 14.90, '58 min', 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1800&q=90', 'A força da floresta através de quem a protege todos os dias.', 'A floresta é feita de muitas vozes. Amazónia Viva acompanha quem vive, trabalha e luta pela sua preservação, revelando uma relação profunda entre território, comunidade e futuro.', true),
  ('11111111-1111-4111-8111-111111111111', 'Última Chamada', 'ultima-chamada', 2022, 'Sociedade', 9.90, '49 min', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1800&q=90', 'Retrato de uma geração que resiste ao silêncio e à indiferença.', 'Entre a urgência e a esperança, Última Chamada dá voz a uma geração que decidiu não ficar em silêncio. Histórias de resistência, amizade e mudança contadas por quem está a construir o seu próprio caminho.', true),
  ('11111111-1111-4111-8111-111111111111', 'Fora de Jogo', 'fora-de-jogo', 2024, 'Desporto', 12.90, '54 min', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1800&q=90', 'Muito além das quatro linhas: sonhos, escolhas e futuros.', 'O jogo começa muito antes do apito inicial. Fora de Jogo revela as histórias, sacrifícios e sonhos que existem por trás de quem entra em campo e de quem encontra no desporto uma possibilidade de futuro.', true),
  ('11111111-1111-4111-8111-111111111111', 'FactorENERGIA', 'factorenergia', 2023, 'Documentário', 12.90, '1h 02min', 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1800&q=90', 'Uma investigação sobre o mercado de energia e os seus impactos.', 'De onde vem a energia que move o nosso dia? FactorENERGIA investiga as escolhas que fazemos, os interesses que as moldam e o impacto que têm nas pessoas e no planeta.', true);

-- 8. SEED DATA: utilizador de demonstração e filmes comprados
insert into auth.users (id, email)
values ('22222222-2222-4222-8222-222222222222', 'marta@teste.com')
on conflict do nothing;

insert into public.profiles (id, name, role)
values ('22222222-2222-4222-8222-222222222222', 'Marta Silva', 'client')
on conflict (id) do update
set name = excluded.name,
    role = excluded.role;

insert into public.purchases (id_user, id_film, price_paid)
select '22222222-2222-4222-8222-222222222222', id_film, price
from public.films
where slug in ('entre-rios', 'fora-de-jogo', 'amazonia-viva')
  and not exists (
    select 1
    from public.purchases as existing_purchase
    where existing_purchase.id_user = '22222222-2222-4222-8222-222222222222'
      and existing_purchase.id_film = public.films.id_film
  );


-- 9. SEED DATA: produtores para as páginas públicas /produtor/[username]
insert into auth.users (id, email)
values
  ('33333333-3333-4333-8333-333333333333', 'astudio@teste.com'),
  ('44444444-4444-4444-8444-444444444444', 'universal@teste.com')
on conflict do nothing;

insert into public.profiles (id, name, role)
values
  ('33333333-3333-4333-8333-333333333333', 'A Studio', 'producer'),
  ('44444444-4444-4444-8444-444444444444', 'Universal', 'producer')
on conflict (id) do update
set name = excluded.name,
    role = excluded.role;

insert into public.producers (id_producer, id_user, company_name, username)
values
  ('55555555-5555-4555-8555-555555555555', '33333333-3333-4333-8333-333333333333', 'A Studio', 'a-studio'),
  ('66666666-6666-4666-8666-666666666666', '44444444-4444-4444-8444-444444444444', 'Universal', 'universal')
on conflict (id_producer) do update
set company_name = excluded.company_name,
    username = excluded.username;

-- Distribui os filmes pelos produtores
update public.films set id_producer = '55555555-5555-4555-8555-555555555555'
where slug in ('entre-rios', 'casa-de-dona-ilda', 'no-fim-do-horizonte');

update public.films set id_producer = '66666666-6666-4666-8666-666666666666'
where slug in ('amazonia-viva', 'ultima-chamada');

-- 10. SEED DATA: compras de vários clientes em meses diferentes (página /admin/[id])
insert into auth.users (id, email)
values
  ('77777777-7777-4777-8777-777777777771', 'joao@teste.com'),
  ('77777777-7777-4777-8777-777777777772', 'ana@teste.com'),
  ('77777777-7777-4777-8777-777777777773', 'rui@teste.com')
on conflict do nothing;

insert into public.profiles (id, name, role)
values
  ('77777777-7777-4777-8777-777777777771', 'João Pereira', 'client'),
  ('77777777-7777-4777-8777-777777777772', 'Ana Costa', 'client'),
  ('77777777-7777-4777-8777-777777777773', 'Rui Santos', 'client')
on conflict (id) do update
set name = excluded.name,
    role = excluded.role;

insert into public.purchases (id_user, id_film, price_paid, purchased_at)
select v.id_user::uuid, f.id_film, f.price, v.purchased_at::timestamptz
from (values
  ('77777777-7777-4777-8777-777777777771', 'entre-rios',          '2026-07-05'),
  ('77777777-7777-4777-8777-777777777772', 'entre-rios',          '2026-08-12'),
  ('77777777-7777-4777-8777-777777777773', 'entre-rios',          '2026-08-20'),
  ('77777777-7777-4777-8777-777777777771', 'casa-de-dona-ilda',   '2026-08-02'),
  ('77777777-7777-4777-8777-777777777772', 'no-fim-do-horizonte', '2026-09-03'),
  ('77777777-7777-4777-8777-777777777773', 'amazonia-viva',       '2026-07-18'),
  ('77777777-7777-4777-8777-777777777771', 'amazonia-viva',       '2026-09-09'),
  ('77777777-7777-4777-8777-777777777772', 'ultima-chamada',      '2026-09-21'),
  ('77777777-7777-4777-8777-777777777773', 'fora-de-jogo',        '2026-08-30'),
  ('77777777-7777-4777-8777-777777777772', 'factorenergia',       '2026-09-14')
) as v(id_user, slug, purchased_at)
join public.films f on f.slug = v.slug
where not exists (
  select 1 from public.purchases p
  where p.id_user = v.id_user::uuid and p.id_film = f.id_film
);
