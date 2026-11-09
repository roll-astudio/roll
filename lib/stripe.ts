import Stripe from "stripe";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let client: Stripe | null = null;

// Cliente Stripe (só servidor). A versão da API é a fixada pelo SDK.
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY em falta");
  client ??= new Stripe(key);
  return client;
}

// URL base do site, para os redirects do Checkout.
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

// Cliente Supabase sem sessão de utilizador (webhook). Usa a service role
// quando existe; sem ela cai na chave pública (RLS está desligado em dev).
function supabaseAdmin() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
}

// Regista a compra a partir de uma Checkout Session paga.
// Idempotente: pode ser chamada pelo webhook e pela página de sucesso.
export async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return false;

  const idUser = session.metadata?.id_user;
  const idFilm = session.metadata?.id_film;
  if (!idUser || !idFilm || session.amount_total == null) return false;

  const { error } = await supabaseAdmin()
    .from("purchases")
    .upsert(
      {
        id_user: idUser,
        id_film: idFilm,
        price_paid: (session.amount_total / 100).toFixed(2),
        stripe_session_id: session.id,
      },
      { onConflict: "id_user,id_film", ignoreDuplicates: true },
    );
  if (error) throw new Error(`Falha ao registar compra: ${error.message}`);
  return true;
}
