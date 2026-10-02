import { createClient } from "@supabase/supabase-js";
import { isUuidV4 } from "./users";

export type AdminFilmStats = {
  title: string;
  slug: string;
  buyers: number;
  total: number;
};

export type ProducerDashboard = {
  name: string;
  months: string[]; // "YYYY-MM", mais recente primeiro
  films: AdminFilmStats[];
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const isValidMonth = (value: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

export async function getProducerDashboard(
  id: string,
  month?: string,
): Promise<ProducerDashboard | null> {
  if (!isUuidV4(id) || !supabase) return null;

  const { data: producer } = await supabase
    .from("producers")
    .select("id_producer, company_name")
    .eq("id_producer", id)
    .maybeSingle();
  if (!producer) return null;

  const { data: films } = await supabase
    .from("films")
    .select("id_film, title, slug")
    .eq("id_producer", id)
    .order("title");

  const filmIds = (films ?? []).map((film) => film.id_film);
  const { data: purchases } = filmIds.length
    ? await supabase
        .from("purchases")
        .select("id_film, price_paid, purchased_at")
        .in("id_film", filmIds)
    : { data: [] };

  const all = purchases ?? [];
  const months = [
    ...new Set(all.map((purchase) => String(purchase.purchased_at).slice(0, 7))),
  ]
    .sort()
    .reverse();
  const selected = month
    ? all.filter((purchase) => String(purchase.purchased_at).startsWith(month))
    : all;

  return {
    name: producer.company_name,
    months,
    films: (films ?? []).map((film) => {
      const sales = selected.filter((purchase) => purchase.id_film === film.id_film);
      return {
        title: film.title,
        slug: film.slug ?? "",
        buyers: sales.length,
        total: sales.reduce((sum, purchase) => sum + Number(purchase.price_paid), 0),
      };
    }),
  };
}
