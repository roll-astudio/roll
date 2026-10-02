import { connection } from "next/server";
import HomeClient from "./HomeClient";
import { getFilms, getPurchasedSlugs, pickRandomFilm } from "../lib/films";
import { createClient } from "../lib/supabase/server";

export default async function Home() {
  // Espera por um pedido real, para o filme em destaque mudar a cada refresh
  await connection();
  const films = await getFilms();
  const featured = pickRandomFilm(films);

  // Filmes que o utilizador com sessão já comprou
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const ownedSlugs = auth.user ? await getPurchasedSlugs(auth.user.id) : [];

  return <HomeClient films={films} featured={featured} ownedSlugs={ownedSlugs} />;
}
