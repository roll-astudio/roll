import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../../components/site-header/SiteHeader";
import { getProducerByUsername } from "../../../lib/producers";
import styles from "./page.module.css";

export default async function ProducerPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const producer = await getProducerByUsername(username);

  if (!producer) notFound();

  return (
    <main className={styles.page}>
      <SiteHeader rootPath="/" />

      <section className={styles.content}>
        <div className={styles.intro}>
          <h1 className={styles.title}>
            <em>{producer.name}</em>
          </h1>
          <p className={styles.lead}>Todos os filmes deste produtor.</p>
        </div>

        <section className={styles.library} aria-labelledby="films-title">
          <h2 id="films-title" className={styles.sectionTitle}>
            Filmes
          </h2>

          {producer.films.length > 0 ? (
            <div className={styles.films}>
              {producer.films.map((film) => (
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
                      {film.category} · {film.year}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>Este produtor ainda não tem filmes.</p>
          )}
        </section>
      </section>
    </main>
  );
}
