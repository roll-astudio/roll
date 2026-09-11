import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import FilmWatchExperience from "./FilmWatchExperience";
import { films, getFilmBySlug } from "../../../lib/films";
import SiteHeader from "../../../components/site-header/SiteHeader";

export function generateStaticParams() {
  return films.map(({ slug }) => ({ slug }));
}

export default async function FilmPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const film = getFilmBySlug(slug);
  const hasAccess = slug === "fora-de-jogo";

  if (!film) notFound();

  return (
    <main className={styles.page}>
      <SiteHeader rootPath="/" />

      <FilmWatchExperience film={film} isOwned={hasAccess} />

      <section className={styles.details}>
        <div>
          <p className={styles.eyebrow}>sobre o filme</p>
          <h2 className={styles.sectionTitle}>Uma história para <em>ficar.</em></h2>
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
