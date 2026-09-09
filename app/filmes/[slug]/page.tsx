import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import FilmWatchExperience from "./FilmWatchExperience";
import { films, getFilmBySlug } from "../../../lib/films";

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
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.active}>Roll</Link>
          <Link href="/#catalogo">Filmes</Link>
          <Link href="/#sobre">Sobre nós</Link>
          <Link href="/#contacto">Contacto</Link>
        </nav>
        <Link href="/" className={styles.brand} aria-label="Roll — início">
          <img src="/logos/ROLL_CORES.png" alt="Roll" />
        </Link>
        <div className={styles.headerTools}>
          <button type="button" aria-label="Pesquisar">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
          </button>
          <button type="button" aria-label="Conta">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3" /><path d="M5 20c.6-3.3 3-5 7-5s6.4 1.7 7 5" /></svg>
          </button>
        </div>
      </header>

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
