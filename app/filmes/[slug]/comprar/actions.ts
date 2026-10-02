"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";

export async function confirmPurchase(slug: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: film } = await supabase
    .from("films")
    .select("id_film, price")
    .eq("slug", slug)
    .maybeSingle();
  if (!film) redirect("/");

  const { data: existing } = await supabase
    .from("purchases")
    .select("id_purchase")
    .eq("id_user", auth.user.id)
    .eq("id_film", film.id_film)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from("purchases").insert({
      id_user: auth.user.id,
      id_film: film.id_film,
      price_paid: film.price,
    });
    if (error) redirect(`/filmes/${slug}/comprar?erro=1`);
  }

  // Mostra a página de sucesso
  redirect(`/filmes/${slug}/comprado`);
}
