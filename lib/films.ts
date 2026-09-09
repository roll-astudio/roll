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

// Temporary in-code catalogue. This module is the single source of truth for film data.
export const films: Film[] = [
  {
    slug: "entre-rios",
    title: "Entre Rios",
    year: "2023",
    category: "Documentário",
    price: "12,90 €",
    duration: "52 min",
    image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1800&q=90",
    description: "As histórias que fluem entre duas margens e transformam destinos.",
    longDescription: "Entre Rios acompanha as pessoas e as memórias que vivem junto às águas. Um retrato íntimo de comunidades ligadas por uma paisagem em constante movimento, onde cada margem guarda uma história e cada travessia revela uma nova forma de pertença.",
  },
  {
    slug: "casa-de-dona-ilda",
    title: "Casa de Dona Ilda",
    year: "2022",
    category: "Documentário",
    price: "9,90 €",
    duration: "46 min",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1800&q=90",
    description: "Memórias de uma casa, de uma vida e de um bairro que mudou.",
    longDescription: "Uma casa pode ser um arquivo vivo. Dona Ilda abre as portas da sua memória para contar a história de um bairro, das pessoas que o construíram e das mudanças que transformaram o lugar que sempre chamou de seu.",
  },
  {
    slug: "no-fim-do-horizonte",
    title: "No Fim do Horizonte",
    year: "2024",
    category: "Documentário",
    price: "14,90 €",
    duration: "1h 06min",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=90",
    description: "Uma expedição sobre limites, coragem e descoberta.",
    longDescription: "Uma viagem aos lugares onde o caminho deixa de ser evidente. Entre montanhas, silêncio e esforço, este filme é um convite a avançar um pouco mais e a descobrir o que existe para lá dos nossos próprios limites.",
  },
  {
    slug: "amaz-nia-viva",
    title: "Amazónia Viva",
    year: "2023",
    category: "Natureza",
    price: "14,90 €",
    duration: "58 min",
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1800&q=90",
    description: "A força da floresta através de quem a protege todos os dias.",
    longDescription: "A floresta é feita de muitas vozes. Amazónia Viva acompanha quem vive, trabalha e luta pela sua preservação, revelando uma relação profunda entre território, comunidade e futuro.",
  },
  {
    slug: "última-chamada",
    title: "Última Chamada",
    year: "2022",
    category: "Sociedade",
    price: "9,90 €",
    duration: "49 min",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1800&q=90",
    description: "Retrato de uma geração que resiste ao silêncio e à indiferença.",
    longDescription: "Entre a urgência e a esperança, Última Chamada dá voz a uma geração que decidiu não ficar em silêncio. Histórias de resistência, amizade e mudança contadas por quem está a construir o seu próprio caminho.",
  },
  {
    slug: "fora-de-jogo",
    title: "Fora de Jogo",
    year: "2024",
    category: "Desporto",
    price: "12,90 €",
    duration: "54 min",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1800&q=90",
    description: "Muito além das quatro linhas: sonhos, escolhas e futuros.",
    longDescription: "O jogo começa muito antes do apito inicial. Fora de Jogo revela as histórias, sacrifícios e sonhos que existem por trás de quem entra em campo e de quem encontra no desporto uma possibilidade de futuro.",
  },
  {
    slug: "factorenergia",
    title: "FactorENERGIA",
    year: "2023",
    category: "Documentário",
    price: "12,90 €",
    duration: "1h 02min",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1800&q=90",
    description: "Uma investigação sobre o mercado de energia e os seus impactos.",
    longDescription: "De onde vem a energia que move o nosso dia? FactorENERGIA investiga as escolhas que fazemos, os interesses que as moldam e o impacto que têm nas pessoas e no planeta.",
  },
];

export function getFilmBySlug(slug: string) {
  return films.find((film) => film.slug === slug);
}
