-- Pagamentos Stripe: cada compra guarda a Checkout Session que a originou
alter table public.purchases
  add column if not exists stripe_session_id text unique;

-- Um utilizador só compra cada filme uma vez (também torna o webhook idempotente)
alter table public.purchases
  add constraint purchases_user_film_unique unique (id_user, id_film);
