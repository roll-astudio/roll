import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SiteHeader from "../../../components/site-header/SiteHeader";
import { getProducerDashboard, isValidMonth } from "../../../lib/admin";
import { getProducerIdForUser } from "../../../lib/producers";
import { createClient } from "../../../lib/supabase/server";
import { setMonthPaid } from "../../gestao/pagamentos";
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

  let isAdmin = false;
  if ((await getProducerIdForUser(supabase, auth.user.id)) !== id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", auth.user.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";
    if (!isAdmin) {
      const own = await getProducerIdForUser(supabase, auth.user.id);
      redirect(own ? `/admin/${own}` : "/");
    }
  }

  const month = mes && isValidMonth(mes) ? mes : undefined;
  const dashboard = await getProducerDashboard(id, month);

  if (!dashboard) notFound();

  const paidMonths = new Set(dashboard.paidMonths);
  const monthPaid = !!month && paidMonths.has(month);

  const totalBuyers = dashboard.films.reduce((sum, film) => sum + film.buyers, 0);
  const totalPayout = dashboard.films.reduce((sum, film) => sum + film.payout, 0);

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
            label: paidMonths.has(value)
              ? `${monthLabel(value)} · pago`
              : monthLabel(value),
          }))}
        />

        {month && (
          <div className={styles.payment}>
            <span className={monthPaid ? styles.paid : styles.unpaid}>
              {monthPaid ? "✓ " : ""}
              {monthLabel(month)} {monthPaid ? "pago" : "por pagar"}
            </span>
            {isAdmin && (
              <form action={setMonthPaid.bind(null, id, month, !monthPaid)}>
                <button type="submit" className={styles.paymentButton}>
                  {monthPaid ? "Desmarcar como pago" : "Marcar como pago"}
                </button>
              </form>
            )}
          </div>
        )}

        {dashboard.films.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Filme</th>
                <th className={styles.num}>Compras</th>
                <th className={styles.num}>% Roll</th>
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
                  <td className={styles.num}>
                    {`${film.share.toLocaleString("pt-PT")}%`}
                  </td>
                  <td className={styles.num}>
                    {euro.format(film.payout)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                <td className={styles.num}>{totalBuyers}</td>
                <td></td>
                <td className={styles.num}>{euro.format(totalPayout)}</td>
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
