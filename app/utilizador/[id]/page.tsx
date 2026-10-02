import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Button from "../../../components/button/Button";
import SiteHeader from "../../../components/site-header/SiteHeader";
import { getUserLibrary } from "../../../lib/users";
import { createClient } from "../../../lib/supabase/server";
import { logout } from "../../login/actions";
import styles from "./page.module.css";

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  // Cada utilizador só vê a sua própria página
  if (auth.user.id !== id) redirect(`/utilizador/${auth.user.id}`);

  const user = await getUserLibrary(id);

  if (!user) notFound();

  return (
    <main className={styles.page}>
      <SiteHeader />

      <section className={styles.content}>
        <div className={styles.intro}>
          <h1 className={styles.title}>
            Olá, <em>{user.name}</em>.
          </h1>
          <p className={styles.lead}>Aqui estão os filmes que compraste.</p>
          <form action={logout}>
            <Button variant="secondary" type="submit" className={styles.logout}>
              Terminar sessão
            </Button>
          </form>
        </div>

        <section className={styles.library} aria-labelledby="library-title">
          <h2 id="library-title" className={styles.sectionTitle}>
            Os meus filmes
          </h2>

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
                    <p>{film.year}</p>
                  </div>
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
