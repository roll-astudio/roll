import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type ProducerFilm = {
  slug: string;
  title: string;
  year: string;
  category: string;
  duration: string;
  image: string;
};

export type Producer = {
  username: string;
  name: string;
  films: ProducerFilm[];
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function getProducerByUsername(
  username: string,
): Promise<Producer | null> {
  if (!supabase) return null;

  const { data: producer } = await supabase
    .from("producers")
    .select("id_producer, company_name, username")
    .ilike("username", username)
    .maybeSingle();

  if (!producer) return null;

  const { data: films } = await supabase
    .from("films")
    .select("slug, title, year, category, duration, image")
    .eq("id_producer", producer.id_producer)
    .eq("is_published", true)
    .order("year", { ascending: false });

  return {
    username: producer.username,
    name: producer.company_name,
    films: (films ?? []).flatMap((film) =>
      film.slug
        ? [
            {
              slug: film.slug,
              title: film.title ?? "",
              year: String(film.year ?? ""),
              category: film.category ?? "",
              duration: film.duration ?? "",
              image: film.image ?? "",
            },
          ]
        : [],
    ),
  };
}

// Id da produtora associada a uma conta (null se a conta não é de um produtor)
export async function getProducerIdForUser(
  client: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data } = await client
    .from("producers")
    .select("id_producer")
    .eq("id_user", userId)
    .limit(1)
    .maybeSingle();
  return data?.id_producer ?? null;
}
