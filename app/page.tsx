"use client";

import { useState } from "react";
import styles from "./page.module.css";

type Film = {
  title: string;
  year: string;
  category: string;
  price: string;
  image: string;
};
const films: Film[] = [
  {
    title: "Entre Rios",
    year: "2023",
    category: "Documentário",
    price: "12,90 €",
    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=88",
  },
  {
    title: "Casa de Dona Ilda",
    year: "2022",
    category: "Documentário",
    price: "9,90 €",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=88",
  },
  {
    title: "No Fim do Horizonte",
    year: "2024",
    category: "Documentário",
    price: "14,90 €",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=88",
  },
  {
    title: "Amazónia Viva",
    year: "2023",
    category: "Natureza",
    price: "14,90 €",
    image:
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=900&q=88",
  },
  {
    title: "Última Chamada",
    year: "2022",
    category: "Sociedade",
    price: "9,90 €",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=88",
  },
  {
    title: "Fora de Jogo",
    year: "2024",
    category: "Desporto",
    price: "12,90 €",
    image:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=88",
  },
  {
    title: "FactorENERGIA",
    year: "2023",
    category: "Documentário",
    price: "12,90 €",
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=88",
  },
];

function Icon({
  name,
  size = 20,
}: {
  name:
    | "play"
    | "info"
    | "search"
    | "user"
    | "instagram"
    | "facebook"
    | "vimeo"
    | "lock"
    | "arrow";
  size?: number;
}) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const icons: Record<string, React.ReactNode> = {
    play: <path d="m9 6 9 6-9 6V6Z" fill="currentColor" stroke="none" />,
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c.6-3.3 3-5 7-5s6.4 1.7 7 5" />
      </>
    ),
    instagram: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
    facebook: (
      <path
        d="M14 8h3V4h-3a5 5 0 0 0-5 5v3H6v4h3v4h4v-4h3l1-4h-4V9a1 1 0 0 1 1-1Z"
        fill="currentColor"
        stroke="none"
      />
    ),
    vimeo: (
      <path
        d="M4 8c1.5-1.8 4.1-3.4 5.4-1.8 1 1.3.7 4.2 1.8 6.7.8 1.8 1.3 1.8 2.2.4.9-1.4 1.8-3.1 1.4-3.5-.4-.4-1.3.2-1.7.7.3-2.5 3.6-4.5 5.5-2.7 1.8 1.8-1.3 7-3.8 9.5-2.3 2.3-4.4 3.1-6.2.1C7.2 14.8 7 10.3 5.6 9.3 5 8.9 4.5 9.4 4 10V8Z"
        fill="currentColor"
        stroke="none"
      />
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
      </>
    ),
    arrow: <path d="M5 12h13m-5-5 5 5-5 5" />,
  };
  return (
    <svg {...p} aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

export default function Home() {
  const [notice, setNotice] = useState("");
  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <a className={styles.active} href="#inicio">
            aTV
          </a>
          <a href="#catalogo">Filmes</a>
          <a href="#sobre">Sobre nós</a>
          <a href="#footer">Contacto</a>
        </nav>
        <a className={styles.brand} href="#inicio">
          a<span>TV</span>
        </a>
        <div className={styles.headerTools}>
          <button
            aria-label="Pesquisar"
            onClick={() => notify("A pesquisa estará disponível em breve")}
          >
            <Icon name="search" size={18} />
          </button>
          <button aria-label="Conta">
            <Icon name="user" size={19} />
          </button>
        </div>
      </header>
      <section className={styles.hero} id="inicio">
        <div className={styles.heroImage} />
        <div className={styles.heroContent}>
          <p className={styles.kicker}>
            <span /> aTV original
          </p>
          <h1>
            O Silêncio
            <br />
            <em>das Pedras</em>
          </h1>
          <div className={styles.meta}>
            <span>Documentário</span>
            <i /> <span>2024</span>
            <i /> <span>1h 18min</span>
            <b>12</b>
          </div>
          <p className={styles.description}>
            Uma jornada intimista sobre memória, território e pertencimento.
            Entre ruínas e lembranças, um encontro profundo com o que permanece.
          </p>
          <div className={styles.heroActions}>
            <button
              className={styles.primary}
              onClick={() => notify("O filme vai começar em breve")}
            >
              <Icon name="play" size={16} /> Ver agora
            </button>
            <button
              className={styles.secondary}
              onClick={() => notify("Mais detalhes em breve")}
            >
              <Icon name="info" size={17} /> Saber mais
            </button>
          </div>
        </div>
        <div className={styles.heroRail}>
          <span>01</span>
          <div />
          <span>03</span>
        </div>
      </section>
      <section className={styles.catalog} id="catalogo">
        <div className={styles.catalogHead}>
          <div>
            <p className={styles.sectionEyebrow}>aTV / catálogo</p>
            <h2>
              Histórias que <em>ficam.</em>
            </h2>
          </div>
          <div className={styles.filters}>
            <button className={styles.filterActive}>Todos</button>
            <button>Documentários</button>
            <button>Ficção</button>
            <button
              className={styles.sort}
              onClick={() => notify("A ordenar pelos mais recentes")}
            >
              Mais recentes <span>⌄</span>
            </button>
          </div>
        </div>
        <div className={styles.grid}>
          {films.map((film) => (
            <article
              className={styles.card}
              key={film.title}
              onClick={() => notify(`A abrir ${film.title}`)}
            >
              <div
                className={styles.cardImage}
                style={{ backgroundImage: `url(${film.image})` }}
              >
                <span className={styles.cardPlay}>
                  <Icon name="play" size={15} />
                </span>
                <span className={styles.cardTag}>{film.category}</span>
              </div>
              <div className={styles.cardBody}>
                <div>
                  <h3>{film.title}</h3>
                  <p>
                      {film.year} <i /> Filme integral
                  </p>
                </div>
                <div className={styles.price}>
                  <Icon name="lock" size={15} /> {film.price}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.about} id="sobre">
        <p className={styles.sectionEyebrow}>o nosso olhar</p>
        <h2>
          Filmes para ver.
          <br />
          <em>Histórias para levar.</em>
        </h2>
        <p>
          Uma selecção independente de obras que aproximam pessoas, lugares e
          ideias. Apoie os criadores e tenha acesso ilimitado aos seus filmes.
        </p>
      </section>
      <footer className={styles.footer} id="footer">
        <a className={styles.brand} href="#inicio">
          a<span>TV</span>
        </a>
        <p>© 2024 aTV. Cinema independente, perto de si.</p>
        <div className={styles.socials}>
          <Icon name="instagram" size={17} />
          <Icon name="facebook" size={17} />
          <Icon name="vimeo" size={19} />
        </div>
      </footer>
      {notice && <div className={styles.toast}>{notice}</div>}
    </main>
  );
}
