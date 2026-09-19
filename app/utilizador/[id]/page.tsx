import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../../components/site-header/SiteHeader";
import { getUserLibrary } from "../../../lib/users";
import styles from "./page.module.css";

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserLibrary(id);

  if (!user) notFound();

  return (
    <main className={styles.page}>
      <SiteHeader rootPath="/" />

      <section className={styles.content}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>a tua conta</p>
          <h1 className={styles.title}>Olá, <em>{user.name}</em>.</h1>
          <p className={styles.lead}>Os teus filmes estão aqui.</p>
        </div>

        <section className={styles.library} aria-labelledby="library-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>a tua biblioteca</p>
            <h2 id="library-title" className={styles.sectionTitle}>Filmes <em>comprados</em></h2>
          </div>

          {user.films.length > 0 ? (
            <div className={styles.films}>
              {user.films.map((film) => (
                <Link
                  key={film.slug}
                  href={`/filmes/${film.slug}`}
                  className={styles.film}
                >
                  <div
                    className={styles.poster}
                    style={{ backgroundImage: `url(${film.image})` }}
                    aria-hidden="true"
                  />
                  <div className={styles.filmInfo}>
                    <h3>{film.title}</h3>
                    <p>
                      {film.year}
                      {film.category && <span> · {film.category}</span>}
                      {film.duration && <span> · {film.duration}</span>}
                    </p>
                  </div>
                  <span className={styles.arrow} aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>Ainda não tens filmes comprados.</p>
          )}
        </section>
      </section>
    </main>
  );
}
