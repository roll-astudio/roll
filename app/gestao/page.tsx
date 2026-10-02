import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "../../components/site-header/SiteHeader";
import { getManagement } from "../../lib/management";
import { isUuidV4 } from "../../lib/users";
import { createClient } from "../../lib/supabase/server";
import ProducerFilter from "./ProducerFilter";
import styles from "./page.module.css";

const euro = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" });
const dateFormat = new Intl.DateTimeFormat("pt-PT", { dateStyle: "short" });

export default async function ManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ produtor?: string }>;
}) {
  const { produtor } = await searchParams;

  // Só administradores
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/");

  const producerId = produtor && isUuidV4(produtor) ? produtor : undefined;
  const { producers, films, sales } = await getManagement(supabase, producerId);

  const totalAmount = sales.reduce((sum, sale) => sum + sale.price, 0);

  return (
    <main className={styles.page}>
      <SiteHeader />

      <section className={styles.content}>
        <div className={styles.intro}>
          <h1 className={styles.title}>
            <em>Gestão</em>
          </h1>
          <p className={styles.lead}>Todos os filmes e vendas da Roll.</p>
        </div>

        <ProducerFilter producers={producers} selected={producerId} />

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span>Filmes</span>
            <strong>{films.length}</strong>
          </div>
          <div className={styles.stat}>
            <span>Vendas</span>
            <strong>{sales.length}</strong>
          </div>
          <div className={styles.stat}>
            <span>Total</span>
            <strong>{euro.format(totalAmount)}</strong>
          </div>
        </div>

        <section className={styles.section} aria-labelledby="films-title">
          <h2 id="films-title" className={styles.sectionTitle}>Filmes</h2>
          {films.length > 0 ? (
            <div className={styles.scroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Filme</th>
                    <th>Produtor</th>
                    <th>Estado</th>
                    <th className={styles.num}>Compras</th>
                    <th className={styles.num}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {films.map((film) => (
                    <tr key={film.slug || film.title}>
                      <td>
                        {film.slug ? (
                          <Link href={`/filmes/${film.slug}`}>{film.title}</Link>
                        ) : (
                          film.title
                        )}
                      </td>
                      <td className={styles.muted}>{film.producer}</td>
                      <td>
                        <span className={`${styles.badge} ${film.published ? styles.badgeOn : ""}`}>
                          {film.published ? "Publicado" : "Rascunho"}
                        </span>
                      </td>
                      <td className={styles.num}>{film.buyers}</td>
                      <td className={styles.num}>{euro.format(film.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.empty}>Sem filmes.</p>
          )}
        </section>

        <section className={styles.section} aria-labelledby="sales-title">
          <h2 id="sales-title" className={styles.sectionTitle}>Vendas</h2>
          {sales.length > 0 ? (
            <div className={styles.scroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Filme</th>
                    <th>Produtor</th>
                    <th>Comprador</th>
                    <th className={styles.num}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id}>
                      <td className={styles.muted}>{dateFormat.format(new Date(sale.date))}</td>
                      <td>{sale.film}</td>
                      <td className={styles.muted}>{sale.producer}</td>
                      <td>{sale.buyer}</td>
                      <td className={styles.num}>{euro.format(sale.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.empty}>Ainda não há vendas.</p>
          )}
        </section>
      </section>
    </main>
  );
}
