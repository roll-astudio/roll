import { createClient } from "@supabase/supabase-js";
import { DEMO_USER_ID } from "./user-constants";

export type PurchasedFilm = {
  slug: string;
  title: string;
  year: string;
  category: string;
  duration: string;
  image: string;
};

export type UserLibrary = {
  id: string;
  name: string;
  films: PurchasedFilm[];
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuidV4(value: string) {
  return UUID_V4.test(value);
}

export async function getUserLibrary(id: string): Promise<UserLibrary | null> {
  if (!isUuidV4(id)) return null;
  if (!supabase) {
    return id === DEMO_USER_ID ? { id, name: "Marta Silva", films: [] } : null;
  }

  const [{ data: profile }, { data: purchases }] = await Promise.all([
    supabase.from("profiles").select("id, name").eq("id", id).maybeSingle(),
    supabase
      .from("purchases")
      .select(
        "films!inner(slug, title, year, category, duration, image), purchased_at",
      )
      .eq("id_user", id)
      .order("purchased_at", { ascending: false }),
  ]);

  // Permite visualizar a rota de demonstração enquanto o seed ainda não foi
  // aplicado no projeto Supabase ligado ao ambiente local.
  if (!profile && id === DEMO_USER_ID) {
    return { id, name: "Marta Silva", films: [] };
  }

  if (!profile) return null;

  return {
    id: profile.id,
    name: profile.name || "Utilizador Roll",
    films: (purchases ?? []).flatMap((purchase) => {
      const film = Array.isArray(purchase.films)
        ? purchase.films[0]
        : purchase.films;
      return film?.slug
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
        : [];
    }),
  };
}
