import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import MuxDemoPlayer from "./MuxDemoPlayer";

type Film = {
  title: string;
  year: string;
  category: string;
  price: string;
  image: string;
  description: string;
  longDescription: string;
  duration: string;
};

const films: Record<string, Film> = {
  "entre-rios": {
    title: "Entre Rios",
    year: "2023",
    category: "Documentário",
    price: "12,90 €",
    duration: "52 min",
    image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1800&q=90",
    description: "As histórias que fluem entre duas margens e transformam destinos.",
    longDescription: "Entre Rios acompanha as pessoas e as memórias que vivem junto às águas. Um retrato íntimo de comunidades ligadas por uma paisagem em constante movimento, onde cada margem guarda uma história e cada travessia revela uma nova forma de pertença.",
  },
  "casa-de-dona-ilda": {
    title: "Casa de Dona Ilda",
    year: "2022",
    category: "Documentário",
    price: "9,90 €",
    duration: "46 min",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1800&q=90",
    description: "Memórias de uma casa, de uma vida e de um bairro que mudou.",
    longDescription: "Uma casa pode ser um arquivo vivo. Dona Ilda abre as portas da sua memória para contar a história de um bairro, das pessoas que o construíram e das mudanças que transformaram o lugar que sempre chamou de seu.",
  },
  "no-fim-do-horizonte": {
    title: "No Fim do Horizonte",
    year: "2024",
    category: "Documentário",
    price: "14,90 €",
    duration: "1h 06min",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=90",
    description: "Uma expedição sobre limites, coragem e descoberta.",
    longDescription: "Uma viagem aos lugares onde o caminho deixa de ser evidente. Entre montanhas, silêncio e esforço, este filme é um convite a avançar um pouco mais e a descobrir o que existe para lá dos nossos próprios limites.",
  },
  "amaz-nia-viva": {
    title: "Amazónia Viva",
    year: "2023",
    category: "Natureza",
    price: "14,90 €",
    duration: "58 min",
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1800&q=90",
    description: "A força da floresta através de quem a protege todos os dias.",
    longDescription: "A floresta é feita de muitas vozes. Amazónia Viva acompanha quem vive, trabalha e luta pela sua preservação, revelando uma relação profunda entre território, comunidade e futuro.",
  },
  "última-chamada": {
    title: "Última Chamada",
    year: "2022",
    category: "Sociedade",
    price: "9,90 €",
    duration: "49 min",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1800&q=90",
    description: "Retrato de uma geração que resiste ao silêncio e à indiferença.",
    longDescription: "Entre a urgência e a esperança, Última Chamada dá voz a uma geração que decidiu não ficar em silêncio. Histórias de resistência, amizade e mudança contadas por quem está a construir o seu próprio caminho.",
  },
  "fora-de-jogo": {
    title: "Fora de Jogo",
    year: "2024",
    category: "Desporto",
    price: "12,90 €",
    duration: "54 min",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1800&q=90",
    description: "Muito além das quatro linhas: sonhos, escolhas e futuros.",
    longDescription: "O jogo começa muito antes do apito inicial. Fora de Jogo revela as histórias, sacrifícios e sonhos que existem por trás de quem entra em campo e de quem encontra no desporto uma possibilidade de futuro.",
  },
  "factorenergia": {
    title: "FactorENERGIA",
    year: "2023",
    category: "Documentário",
    price: "12,90 €",
    duration: "1h 02min",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1800&q=90",
    description: "Uma investigação sobre o mercado de energia e os seus impactos.",
    longDescription: "De onde vem a energia que move o nosso dia? FactorENERGIA investiga as escolhas que fazemos, os interesses que as moldam e o impacto que têm nas pessoas e no planeta.",
  },
};

export function generateStaticParams() {
  return Object.keys(films).map((slug) => ({ slug }));
}

export default async function FilmPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const film = films[slug];
  const hasAccess = slug === "fora-de-jogo";

  if (!film) notFound();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>← Voltar ao catálogo</Link>
        <Link href="/" className={styles.brand}><img src="/logos/ROLL_CORES.png" alt="Meu Logo" /></Link>
        <span className={styles.headerLabel}>Roll / filme</span>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroImage} style={{ backgroundImage: `url(${film.image})` }} />
        <div className={styles.heroShade} />
        {hasAccess && <MuxDemoPlayer duration={film.duration} />}
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>{film.category} <i /> {film.year}</p>
          <h1 className={styles.title}>{film.title}</h1>
          <p className={styles.lead}>{film.description}</p>
          <div className={styles.actions}>
            {hasAccess ? (
              <span className={styles.owned}><span>✓</span> Na tua biblioteca</span>
            ) : (
              <button className={styles.primary}>Comprar acesso · {film.price}</button>
            )}
            <span className={styles.duration}>{film.duration} <i /> Acesso ilimitado</span>
          </div>
        </div>
      </section>

      <section className={styles.details}>
        <div>
          <p className={styles.eyebrow}>sobre o filme</p>
          <h2 className={styles.sectionTitle}>Uma história para <em>ficar.</em></h2>
        </div>
        <div className={styles.description}>
          <p>{film.longDescription}</p>
          <Link href="/" className={styles.catalogLink}>Ver outros filmes <span>↗</span></Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>© 2024 Roll</span>
        <span>Cinema independente, perto de si.</span>
      </footer>
    </main>
  );
}
