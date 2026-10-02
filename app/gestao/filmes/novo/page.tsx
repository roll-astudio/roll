import SiteHeader from "../../../../components/site-header/SiteHeader";
import { requireAdmin } from "../../../../lib/admin-auth";
import GestaoNav from "../../GestaoNav";
import { createFilm } from "../actions";
import FilmForm from "../FilmForm";
import styles from "../page.module.css";

export default async function NewFilmPage() {
  const supabase = await requireAdmin();

  const { data: producers } = await supabase
    .from("producers")
    .select("id_producer, company_name")
    .order("company_name");

  return (
    <main className={styles.page}>
      <SiteHeader />

      <section className={styles.content}>
        <div className={styles.intro}>
          <h1 className={styles.title}>
            Criar <em>filme.</em>
          </h1>
          <p className={styles.lead}>Adiciona um novo filme ao catálogo.</p>
        </div>

        <GestaoNav active="novo" />

        <FilmForm
          formAction={createFilm}
          submitLabel="Criar filme"
          producers={(producers ?? []).map((p) => ({
            id: p.id_producer as string,
            name: p.company_name as string,
          }))}
        />
      </section>
    </main>
  );
}
