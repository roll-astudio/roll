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
  const paidAmount = dashboard.monthlyPayouts
    .filter((row) => paidMonths.has(row.month))
    .reduce((sum, row) => sum + row.payout, 0);
  const pendingAmount = dashboard.monthlyPayouts
    .filter((row) => !paidMonths.has(row.month))
    .reduce((sum, row) => sum + row.payout, 0);

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
                <td className={styles.num}>{euro.format(totalPayout)}</td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <p className={styles.empty}>Ainda não tens filmes.</p>
        )}

        {dashboard.monthlyPayouts.length > 0 && (
          <section className={styles.payments} aria-labelledby="payments-title">
            <h2 id="payments-title" className={styles.sectionTitle}>Pagamentos</h2>
            <p className={styles.paymentSummary}>
              <span className={styles.paid}>Já pago: {euro.format(paidAmount)}</span>
              <span>Por pagar: {euro.format(pendingAmount)}</span>
            </p>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th className={styles.num}>A receber</th>
                  <th className={styles.num}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.monthlyPayouts.map((row) => {
                  const isPaid = paidMonths.has(row.month);
                  return (
                    <tr key={row.month}>
                      <td>{monthLabel(row.month)}</td>
                      <td className={styles.num}>{euro.format(row.payout)}</td>
                      <td className={styles.num}>
                        {isAdmin ? (
                          <form action={setMonthPaid.bind(null, id, row.month, !isPaid)}>
                            <button
                              type="submit"
                              className={`${styles.paymentButton} ${isPaid ? styles.paymentButtonOn : ""}`}
                            >
                              {isPaid ? "✓ Pago" : "Marcar como pago"}
                            </button>
                          </form>
                        ) : (
                          <span className={isPaid ? styles.paid : styles.unpaid}>
                            {isPaid ? "✓ Pago" : "Por pagar"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}
      </section>
    </main>
  );
}
