"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { getStripe, siteUrl } from "../../../../lib/stripe";

// Cria uma Stripe Checkout Session com o preço actual do filme e
// redirecciona para a página de pagamento. A compra só é registada
// depois de paga (webhook / página de sucesso).
export async function confirmPurchase(slug: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: film } = await supabase
    .from("films")
    .select("id_film, title, image, price")
    .eq("slug", slug)
    .maybeSingle();
  if (!film) redirect("/");

  const { data: existing } = await supabase
    .from("purchases")
    .select("id_purchase")
    .eq("id_user", auth.user.id)
    .eq("id_film", film.id_film)
    .maybeSingle();
  if (existing) redirect(`/filmes/${slug}/comprado`);

  const base = siteUrl();
  let checkoutUrl: string | null = null;
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: auth.user.email ?? undefined,
      client_reference_id: auth.user.id,
      metadata: { id_user: auth.user.id, id_film: film.id_film },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(Number(film.price) * 100),
            product_data: {
              name: film.title,
              ...(film.image?.startsWith("http") ? { images: [film.image] } : {}),
            },
          },
        },
      ],
      success_url: `${base}/filmes/${slug}/comprado?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/filmes/${slug}/comprar`,
    });
    checkoutUrl = session.url;
  } catch (error) {
    console.error("Stripe checkout", error);
  }

  if (!checkoutUrl) redirect(`/filmes/${slug}/comprar?erro=1`);
  redirect(checkoutUrl);
}
