import { notFound } from "next/navigation";
import SiteHeader from "../../../../../components/site-header/SiteHeader";
import { requireAdmin } from "../../../../../lib/admin-auth";
import { isUuidV4 } from "../../../../../lib/users";
import GestaoNav from "../../../GestaoNav";
import { updateFilm } from "../../actions";
import FilmForm from "../../FilmForm";
import styles from "../../page.module.css";

export default async function EditFilmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await requireAdmin();
  if (!isUuidV4(id)) notFound();

  const { data: film } = await supabase
    .from("films")
    .select("id_film, id_producer, title, price, description, image, video_url")
    .eq("id_film", id)
    .maybeSingle();
  if (!film) notFound();

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
            Editar <em>filme.</em>
          </h1>
          <p className={styles.lead}>{film.title}</p>
        </div>

        <GestaoNav active="geral" />

        <FilmForm
          formAction={updateFilm.bind(null, film.id_film)}
          submitLabel="Guardar alterações"
          initial={{
            producer: film.id_producer,
            title: film.title,
            price: Number(film.price).toFixed(2).replace(".", ","),
            description: film.description ?? "",
            image: film.image ?? "",
            video: film.video_url ?? "",
          }}
          producers={(producers ?? []).map((p) => ({
            id: p.id_producer as string,
            name: p.company_name as string,
          }))}
        />
      </section>
    </main>
  );
}
