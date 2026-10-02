import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SiteHeader from "../../../components/site-header/SiteHeader";
import { getProducerDashboard, isValidMonth } from "../../../lib/admin";
import { getProducerIdForUser } from "../../../lib/producers";
import { createClient } from "../../../lib/supabase/server";
import MonthFilter from "./MonthFilter";
import styles from "./page.module.css";

const euro = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" });

function monthLabel(month: string) {
  const [year, m] = month.split("-").map(Number);
  const name = new Intl.DateTimeFormat("pt-PT", { month: "long" }).format(
    new Date(year, m - 1, 1),
  );
  return `${name} ${year}`;
}

export default async function AdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mes?: string }>;
}) {
  const { id } = await params;
  const { mes } = await searchParams;

  // Só o produtor dono deste painel (ou um admin) pode ver as vendas
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  if ((await getProducerIdForUser(supabase, auth.user.id)) !== id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", auth.user.id)
      .maybeSingle();
    if (profile?.role !== "admin") {
      const own = await getProducerIdForUser(supabase, auth.user.id);
      redirect(own ? `/admin/${own}` : "/");
    }
  }

  const month = mes && isValidMonth(mes) ? mes : undefined;
  const dashboard = await getProducerDashboard(id, month);

  if (!dashboard) notFound();

  const totalBuyers = dashboard.films.reduce((sum, film) => sum + film.buyers, 0);
  const totalAmount = dashboard.films.reduce((sum, film) => sum + film.total, 0);

  return (
    <main className={styles.page}>
      <SiteHeader />

      <section className={styles.content}>
        <div className={styles.intro}>
          <h1 className={styles.title}>
            <em>{dashboard.name}</em>
          </h1>
          <p className={styles.lead}>Vendas dos teus filmes.</p>
        </div>

        <MonthFilter
          id={id}
          selected={month}
          months={dashboard.months.map((value) => ({
            value,
            label: monthLabel(value),
          }))}
        />

        {dashboard.films.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Filme</th>
                <th className={styles.num}>Compras</th>
                <th className={styles.num}>Total a receber</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.films.map((film) => (
                <tr key={film.slug || film.title}>
                  <td>
                    {film.slug ? (
                      <Link href={`/filmes/${film.slug}`}>{film.title}</Link>
                    ) : (
                      film.title
                    )}
                  </td>
                  <td className={styles.num}>{film.buyers}</td>
                  <td className={styles.num}>{euro.format(film.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                <td className={styles.num}>{totalBuyers}</td>
                <td className={styles.num}>{euro.format(totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <p className={styles.empty}>Ainda não tens filmes.</p>
        )}
      </section>
    </main>
  );
}
