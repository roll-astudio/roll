import type { SupabaseClient } from "@supabase/supabase-js";

export type ManagementProducer = { id: string; name: string };

export type ManagementFilm = {
  producerId: string;
  slug: string;
  title: string;
  producer: string;
  published: boolean;
  buyers: number;
  total: number;
};

export type ManagementSale = {
  producerId: string;
  id: string;
  date: string;
  film: string;
  producer: string;
  buyer: string;
  price: number;
};

export type Management = {
  producers: ManagementProducer[];
  months: string[]; // "YYYY-MM", mais recente primeiro
  films: ManagementFilm[];
  sales: ManagementSale[];
};

// Visão global para o admin: todos os filmes e vendas, opcionalmente de um só produtor
export async function getManagement(
  supabase: SupabaseClient,
  producerId?: string,
  month?: string,
): Promise<Management> {
  const { data: producerRows } = await supabase
    .from("producers")
    .select("id_producer, company_name")
    .order("company_name");
  const producers = (producerRows ?? []).map((row) => ({
    id: row.id_producer as string,
    name: row.company_name as string,
  }));
  const producerName = new Map(producers.map((p) => [p.id, p.name]));

  let filmQuery = supabase
    .from("films")
    .select("id_film, id_producer, title, slug, is_published")
    .order("title");
  if (producerId) filmQuery = filmQuery.eq("id_producer", producerId);
  const { data: filmRows } = await filmQuery;
  const filmList = filmRows ?? [];

  const filmIds = filmList.map((film) => film.id_film);
  const { data: purchaseRows } = filmIds.length
    ? await supabase
        .from("purchases")
        .select("id_purchase, id_film, id_user, price_paid, purchased_at")
        .in("id_film", filmIds)
        .order("purchased_at", { ascending: false })
    : { data: [] };
  const allPurchases = purchaseRows ?? [];

  // Meses com vendas (do produtor escolhido), para o filtro
  const months = [
    ...new Set(allPurchases.map((p) => String(p.purchased_at).slice(0, 7))),
  ]
    .sort()
    .reverse();
  const purchases = month
    ? allPurchases.filter((p) => String(p.purchased_at).startsWith(month))
    : allPurchases;

  const userIds = [...new Set(purchases.map((purchase) => purchase.id_user))];
  const { data: profileRows } = userIds.length
    ? await supabase.from("profiles").select("id, name").in("id", userIds)
    : { data: [] };
  const buyerName = new Map((profileRows ?? []).map((p) => [p.id, p.name]));

  const filmById = new Map(filmList.map((film) => [film.id_film, film]));

  return {
    producers,
    months,
    films: filmList.map((film) => {
      const sales = purchases.filter((p) => p.id_film === film.id_film);
      return {
        producerId: film.id_producer as string,
        slug: film.slug ?? "",
        title: film.title,
        producer: producerName.get(film.id_producer) ?? "—",
        published: !!film.is_published,
        buyers: sales.length,
        total: sales.reduce((sum, p) => sum + Number(p.price_paid), 0),
      };
    }),
    sales: purchases.map((purchase) => {
      const film = filmById.get(purchase.id_film);
      return {
        producerId: (film?.id_producer ?? "") as string,
        id: purchase.id_purchase as string,
        date: String(purchase.purchased_at),
        film: film?.title ?? "—",
        producer: producerName.get(film?.id_producer ?? "") ?? "—",
        buyer: buyerName.get(purchase.id_user) || "Utilizador Roll",
        price: Number(purchase.price_paid),
      };
    }),
  };
}
