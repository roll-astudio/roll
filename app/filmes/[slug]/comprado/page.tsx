import { notFound, redirect } from "next/navigation";
import Button from "../../../../components/button/Button";
import SiteHeader from "../../../../components/site-header/SiteHeader";
import { getFilmBySlug } from "../../../../lib/films";
import { createClient } from "../../../../lib/supabase/server";
import { fulfillCheckoutSession, getStripe } from "../../../../lib/stripe";
import styles from "../comprar/page.module.css";

export default async function PurchaseSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { slug } = await params;
  const { session_id } = await searchParams;
  const film = await getFilmBySlug(slug);
  if (!film) notFound();

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  // O webhook pode chegar depois do redirect: confirma a sessão no Stripe
  // e regista a compra aqui se ainda não existir (é idempotente).
  if (session_id) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(session_id);
      if (session.metadata?.id_user === auth.user.id) await fulfillCheckoutSession(session);
    } catch (error) {
      console.error("Stripe session", error);
    }
  }

  // Só mostra o sucesso a quem realmente comprou o filme
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id_purchase, films!inner(slug)")
    .eq("id_user", auth.user.id)
    .eq("films.slug", slug)
    .limit(1)
    .maybeSingle();
  if (!purchase) redirect(`/filmes/${slug}`);

  return (
    <main className={styles.page}>
      <SiteHeader />

      <section className={styles.content}>
        <h1 className={styles.title}>
          Compra <em>concluída.</em>
        </h1>

        <div className={styles.summary}>
          <div
            className={styles.poster}
            style={{ backgroundImage: `url(${film.image})` }}
            aria-hidden="true"
          />
          <div>
            <h2>{film.title}</h2>
            <p>
              {film.category} · {film.year} · {film.duration}
            </p>
            <p className={styles.price}>{film.price}</p>
          </div>
        </div>

        <p className={styles.message}>Já tens acesso a este filme. Boa sessão!</p>

        <div className={styles.actions}>
          <Button variant="primary" href={`/filmes/${slug}?ver=1`}>
            Ver filme
          </Button>
          <Button variant="secondary" href="/">
            Voltar ao catálogo
          </Button>
        </div>
      </section>
    </main>
  );
}
