import { connection } from "next/server";
import HomeClient from "./HomeClient";
import { getFilms, pickRandomFilm } from "../lib/films";

export default async function Home() {
  // Espera por um pedido real, para o filme em destaque mudar a cada refresh
  await connection();
  const films = await getFilms();
  const featured = pickRandomFilm(films);
  return <HomeClient films={films} featured={featured} />;
}
