// Categorias de filme (guardadas em films.category) e grupos do filtro da home
export const FILM_CATEGORIES = ["Filme", "Documentário", "Outro"] as const;

export const CATEGORY_FILTERS = [
  { key: "Filme", label: "Filmes" },
  { key: "Documentário", label: "Documentários" },
  { key: "Outro", label: "Outros" },
] as const;

// Qualquer valor antigo que não seja Filme/Documentário conta como "Outro"
export function categoryGroup(category: string) {
  return category === "Filme" || category === "Documentário" ? category : "Outro";
}
