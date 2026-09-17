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
};

export async function getFilms(): Promise<Film[]> {
  if (!supabase) return [];

  // Vai buscar os filmes à tabela 'films'
  const { data: rawFilms } = await supabase.from("films").select("*");
  // Transforma os dados da base de dados para o tipo Film exato que a aplicação espera
  return (rawFilms as SupabaseFilm[] | null || []).map((film) => ({
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
  }));
}

export async function getFilmBySlug(slug: string) {
  const films = await getFilms();
  return films.find((film) => film.slug === slug);
}
