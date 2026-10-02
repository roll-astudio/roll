import { createClient } from "@supabase/supabase-js";

export type Film = {
  slug: string;
  title: string;
  year: string;
  category: string;
  price: string;
  duration: string;
  image: string;
  description: string;
  longDescription: string;
  videoUrl: string;
  published: boolean;
  producer: { name: string; username: string } | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

type SupabaseFilm = {
  slug?: string;
  title?: string;
  year?: string | number;
  category?: string;
  price?: string | number;
  duration?: string;
  image?: string;
  description?: string;
  long_description?: string;
  longDescription?: string;
  video_url?: string | null;
  is_published?: boolean | null;
  producers?:
    | { company_name?: string; username?: string | null }
    | { company_name?: string; username?: string | null }[]
    | null;
};

// Por omissão só devolve filmes ativos (publicados); o admin pode pedir todos
export async function getFilms(includeUnpublished = false): Promise<Film[]> {
  if (!supabase) return [];

  // Vai buscar os filmes à tabela 'films'
  let query = supabase
    .from("films")
    .select("*, producers(company_name, username)");
  if (!includeUnpublished) query = query.eq("is_published", true);
  const { data: rawFilms } = await query;
  // Transforma os dados da base de dados para o tipo Film exato que a aplicação espera
  return (rawFilms as SupabaseFilm[] | null || []).map((film) => {
    const producer = Array.isArray(film.producers)
      ? film.producers[0]
      : film.producers;
    return {
    slug: film.slug ?? "",
    title: film.title ?? "",
    year: String(film.year ?? ""),
    category: film.category ?? "",
    price:
      typeof film.price === "number"
        ? `${film.price.toFixed(2).replace(".", ",")} €`
        : (film.price ?? ""),
    duration: film.duration ?? "",
    image: film.image ?? "",
    description: film.description ?? "",
    longDescription: film.long_description ?? film.longDescription ?? "",
    videoUrl: film.video_url ?? "",
    published: !!film.is_published,
    producer:
      producer?.company_name && producer.username
        ? { name: producer.company_name, username: producer.username }
        : null,
  };
  });
}

export async function getFilmBySlug(slug: string, includeUnpublished = false) {
  const films = await getFilms(includeUnpublished);
  return films.find((film) => film.slug === slug);
}

export function pickRandomFilm(films: Film[]): Film | null {
  if (films.length === 0) return null;
  return films[Math.floor(Math.random() * films.length)];
}

export async function getPurchasedSlugs(userId: string): Promise<string[]> {
  if (!supabase) return [];

  const { data } = await supabase
    .from("purchases")
    .select("films!inner(slug)")
    .eq("id_user", userId);

  return (data ?? []).flatMap((purchase) => {
    const film = Array.isArray(purchase.films)
      ? purchase.films[0]
      : purchase.films;
    return film?.slug ? [film.slug] : [];
  });
}
