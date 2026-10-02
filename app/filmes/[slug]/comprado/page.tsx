import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SiteHeader from "../../../../components/site-header/SiteHeader";
import { getFilmBySlug } from "../../../../lib/films";
import { createClient } from "../../../../lib/supabase/server";
import styles from "../comprar/page.module.css";

export default async function PurchaseSuccessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const film = await getFilmBySlug(slug);
  if (!film) notFound();

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

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
      <SiteHeader rootPath="/" />

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
          <Link href={`/filmes/${slug}?ver=1`} className={styles.confirm}>
            Ver filme
          </Link>
          <Link href="/" className={styles.cancel}>
            Voltar ao catálogo
          </Link>
        </div>
      </section>
    </main>
  );
}
