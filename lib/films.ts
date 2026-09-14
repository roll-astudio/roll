import {createClient} from "@supabase/supabase-js";

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
const supabase = createClient(supabaseUrl, supabaseKey);

// Vai buscar os filmes à tabela 'movies'
const { data: rawFilms } = await supabase.from("movies").select("*");

// Transforma os dados da base de dados para o tipo Film exato que a aplicação espera
export const films: Film[] = (rawFilms || []).map((film: any) => ({
  slug: film.slug ?? "",
  title: film.title ?? "",
  year: String(film.year ?? ""),
  category: film.category ?? "",
  price: typeof film.price === "number" ? `${film.price.toFixed(2).replace(".", ",")} €` : (film.price ?? ""),
  duration: film.duration ?? "",
  image: film.image ?? "",
  description: film.description ?? "",
  longDescription: film.long_description ?? film.longDescription ?? "",
}));

export function getFilmBySlug(slug: string) {
  return films.find((film) => film.slug === slug);
}
