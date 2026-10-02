import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "../../../components/site-header/SiteHeader";
import { getManagementUsers } from "../../../lib/management";
import { createClient } from "../../../lib/supabase/server";
import GestaoNav from "../GestaoNav";
import styles from "../page.module.css";

const euro = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" });
const dateFormat = new Intl.DateTimeFormat("pt-PT", { dateStyle: "short" });

const roleLabel: Record<string, string> = {
  client: "Cliente",
  producer: "Produtor",
  admin: "Admin",
};

export default async function ManagementUsersPage() {
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

  const users = await getManagementUsers(supabase);
  const totalPurchases = users.reduce((sum, user) => sum + user.purchases.length, 0);
  const totalAmount = users.reduce((sum, user) => sum + user.total, 0);

  return (
    <main className={styles.page}>
      <SiteHeader />

      <section className={styles.content}>
        <div className={styles.intro}>
          <h1 className={styles.title}>
            <em>Utilizadores</em>
          </h1>
          <p className={styles.lead}>Quem está na Roll e o que já comprou.</p>
        </div>

        <GestaoNav active="utilizadores" />

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span>Utilizadores</span>
            <strong>{users.length}</strong>
          </div>
          <div className={styles.stat}>
            <span>Compras</span>
            <strong>{totalPurchases}</strong>
          </div>
          <div className={styles.stat}>
            <span>Total</span>
            <strong>{euro.format(totalAmount)}</strong>
          </div>
        </div>

        <div className={styles.users}>
          {users.map((user) => (
            <article key={user.id} className={styles.user}>
              <div className={styles.userHead}>
                <h3>{user.name}</h3>
                <span className={styles.badge}>{roleLabel[user.role] ?? user.role}</span>
                <span className={styles.muted}>
                  desde {dateFormat.format(new Date(user.joined))}
                </span>
                <span className={styles.userTotal}>
                  {user.purchases.length}{" "}
                  {user.purchases.length === 1 ? "compra" : "compras"} ·{" "}
                  {euro.format(user.total)}
                </span>
              </div>

              {user.purchases.length > 0 ? (
                <ul className={styles.userFilms}>
                  {user.purchases.map((purchase) => (
                    <li key={purchase.id}>
                      <span className={styles.date}>
                        {dateFormat.format(new Date(purchase.date))}
                      </span>
                      {purchase.slug ? (
                        <Link href={`/filmes/${purchase.slug}`}>{purchase.film}</Link>
                      ) : (
                        <span>{purchase.film}</span>
                      )}
                      <span className={styles.price}>{euro.format(purchase.price)}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
