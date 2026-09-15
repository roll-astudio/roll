import HomeClient from "./HomeClient";
import { getFilms } from "../lib/films";

export default async function Home() {
  const films = await getFilms();
  return <HomeClient films={films} />;
}
