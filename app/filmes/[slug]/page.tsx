import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import FilmWatchExperience from "./FilmWatchExperience";
import { getFilms, getFilmBySlug } from "../../../lib/films";
import { createClient } from "../../../lib/supabase/server";
import SiteHeader from "../../../components/site-header/SiteHeader";

export async function generateStaticParams() {
  const films = await getFilms();
  return films.map(({ slug }) => ({ slug }));
}

export default async function FilmPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ver?: string }>;
}) {
  const { slug } = await params;
  const { ver } = await searchParams;
  const film = await getFilmBySlug(slug, true);

  if (!film) notFound();

  // O utilizador tem acesso se já comprou este filme
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  let hasAccess = false;
  if (auth.user) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id_purchase, films!inner(slug)")
      .eq("id_user", auth.user.id)
      .eq("films.slug", slug)
      .limit(1)
      .maybeSingle();
    hasAccess = !!purchase;
  }

  // Filmes desativados só se vêem a quem já os comprou e aos admins
  if (!film.published && !hasAccess) {
    let isAdmin = false;
    if (auth.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", auth.user.id)
        .maybeSingle();
      isAdmin = profile?.role === "admin";
    }
    if (!isAdmin) notFound();
  }

  return (
    <main className={styles.page}>
      <SiteHeader />

      <FilmWatchExperience
        film={film}
        isOwned={hasAccess}
        autoPlay={ver === "1"}
      />

      <section className={styles.details}>
        <div>
          <p className={styles.eyebrow}>sobre o filme</p>
        </div>
        <div className={styles.description}>
          <p>{film.longDescription}</p>
          <Link href="/" className={styles.catalogLink}>Ver outros filmes <span>↗</span></Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>© 2024 Roll</span>
        <span>Cinema independente, perto de si.</span>
      </footer>
    </main>
  );
}
