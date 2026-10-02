"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../../lib/admin-auth";
import { isUuidV4 } from "../../../lib/users";

export type FilmFormState = {
  error?: string;
  values?: Record<string, string>;
};

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

// Lê e valida os campos do formulário (criar e editar usam o mesmo)
function parseFilmForm(formData: FormData) {
  const values = {
    producer: String(formData.get("producer") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
    price: String(formData.get("price") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    image: String(formData.get("image") ?? "").trim(),
    video: String(formData.get("video") ?? "").trim(),
  };

  let error: string | undefined;
  const price = Number(values.price.replace(",", "."));
  if (!isUuidV4(values.producer)) error = "Escolhe a produtora.";
  else if (!values.title) error = "Escreve o nome do filme.";
  else if (!Number.isFinite(price) || price <= 0)
    error = "Indica um preço válido, por exemplo 12,90.";
  else if (!values.description) error = "Escreve uma pequena descrição.";
  else if (!isHttpUrl(values.image)) error = "O URL da imagem não é válido.";
  else if (!isHttpUrl(values.video)) error = "O URL do vídeo no Mux não é válido.";

  return { values, price, error };
}

export async function createFilm(
  _: FilmFormState,
  formData: FormData,
): Promise<FilmFormState> {
  const supabase = await requireAdmin();
  const { values, price, error: invalid } = parseFilmForm(formData);
  if (invalid) return { error: invalid, values };

  const { data: producer } = await supabase
    .from("producers")
    .select("id_producer")
    .eq("id_producer", values.producer)
    .maybeSingle();
  if (!producer) return { error: "Esta produtora não existe.", values };

  // Slug único a partir do nome
  const base = slugify(values.title) || "filme";
  const { data: existing } = await supabase
    .from("films")
    .select("slug")
    .like("slug", `${base}%`);
  const taken = new Set((existing ?? []).map((film) => film.slug));
  let slug = base;
  for (let n = 2; taken.has(slug); n += 1) slug = `${base}-${n}`;

  const { error } = await supabase.from("films").insert({
    id_producer: values.producer,
    title: values.title,
    slug,
    year: new Date().getFullYear(),
    price: price.toFixed(2),
    description: values.description,
    long_description: values.description,
    image: values.image,
    video_url: values.video,
    is_published: true,
    published_at: new Date().toISOString(),
  });
  if (error) return { error: "Não foi possível criar o filme. Tenta novamente.", values };

  revalidatePath("/gestao");
  redirect(`/filmes/${slug}`);
}

// O endereço (slug) não muda ao editar, para os links continuarem a funcionar
export async function updateFilm(
  filmId: string,
  _: FilmFormState,
  formData: FormData,
): Promise<FilmFormState> {
  const supabase = await requireAdmin();
  if (!isUuidV4(filmId)) redirect("/gestao");

  const { values, price, error: invalid } = parseFilmForm(formData);
  if (invalid) return { error: invalid, values };

  const { data: producer } = await supabase
    .from("producers")
    .select("id_producer")
    .eq("id_producer", values.producer)
    .maybeSingle();
  if (!producer) return { error: "Esta produtora não existe.", values };

  const { error } = await supabase
    .from("films")
    .update({
      id_producer: values.producer,
      title: values.title,
      price: price.toFixed(2),
      description: values.description,
      long_description: values.description,
      image: values.image,
      video_url: values.video,
    })
    .eq("id_film", filmId);
  if (error) return { error: "Não foi possível guardar as alterações.", values };

  revalidatePath("/gestao");
  redirect("/gestao");
}

// Ativa (publica) ou desativa um filme
export async function setFilmPublished(filmId: string, published: boolean) {
  const supabase = await requireAdmin();
  if (!isUuidV4(filmId)) return;

  await supabase
    .from("films")
    .update({
      is_published: published,
      ...(published ? { published_at: new Date().toISOString() } : {}),
    })
    .eq("id_film", filmId);

  revalidatePath("/gestao");
  revalidatePath("/");
}
