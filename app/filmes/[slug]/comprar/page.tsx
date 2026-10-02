import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SiteHeader from "../../../../components/site-header/SiteHeader";
import { getFilmBySlug } from "../../../../lib/films";
import { createClient } from "../../../../lib/supabase/server";
import { confirmPurchase } from "./actions";
import styles from "./page.module.css";

export default async function BuyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { slug } = await params;
  const { erro } = await searchParams;

  const film = await getFilmBySlug(slug);
  if (!film) notFound();

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  return (
    <main className={styles.page}>
      <SiteHeader rootPath="/" />

      <section className={styles.content}>
        <h1 className={styles.title}>
          Confirmar <em>compra.</em>
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

        {erro && (
          <p className={styles.error} role="alert">
            Não foi possível concluir a compra. Tenta novamente.
          </p>
        )}

        <form action={confirmPurchase.bind(null, slug)} className={styles.actions}>
          <button type="submit" className={styles.confirm}>
            Aprovar compra
          </button>
          <Link href={`/filmes/${slug}`} className={styles.cancel}>
            Cancelar
          </Link>
        </form>
      </section>
    </main>
  );
}
