"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

type Film = {
  title: string;
  year: string;
  category: string;
  price: string;
  description: string;
  image: string;
};
const films: Film[] = [
  {
    title: "Entre Rios",
    year: "2023",
    category: "Documentário",
    price: "12,90 €",
    description: "As histórias que fluem entre duas margens e transformam destinos.",
    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=88",
  },
  {
    title: "Casa de Dona Ilda",
    year: "2022",
    category: "Documentário",
    price: "9,90 €",
    description: "Memórias de uma casa, de uma vida e de um bairro que mudou.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=88",
  },
  {
    title: "No Fim do Horizonte",
    year: "2024",
    category: "Documentário",
    price: "14,90 €",
    description: "Uma expedição sobre limites, coragem e descoberta.",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=88",
  },
  {
    title: "Amazónia Viva",
    year: "2023",
    category: "Natureza",
    price: "14,90 €",
    description: "A força da floresta através de quem a protege todos os dias.",
    image:
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=900&q=88",
  },
  {
    title: "Última Chamada",
    year: "2022",
    category: "Sociedade",
    price: "9,90 €",
    description: "Retrato de uma geração que resiste ao silêncio e à indiferença.",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=88",
  },
  {
    title: "Fora de Jogo",
    year: "2024",
    category: "Desporto",
    price: "12,90 €",
    description: "Muito além das quatro linhas: sonhos, escolhas e futuros.",
    image:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=88",
  },
  {
    title: "FactorENERGIA",
    year: "2023",
    category: "Documentário",
    price: "12,90 €",
    description: "Uma investigação sobre o mercado de energia e os seus impactos.",
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
            Roll
          </a>
          <a href="#catalogo">Filmes</a>
          <a href="#sobre">Sobre nós</a>
          <a href="#contacto">Contacto</a>
        </nav>
        <a className={styles.brand} href="#inicio">
         <img src="/logos/ROLL_CORES.png" alt="Meu Logo" />
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
            <span /> Roll original
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
        
      </section>

      
      <section className={styles.catalog} id="catalogo">
        <div className={styles.catalogHead}>
          <div>
            <p className={styles.sectionEyebrow}>Roll / catálogo</p>
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
            <Link
              className={styles.card}
              key={film.title}
              href={`/filmes/${film.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
            >
              <div
                className={styles.cardImage}
                style={{ backgroundImage: `url(${film.image})` }}
              >
                <div className={styles.cardOverlay}>
                  <div className={styles.cardCopy}>
                    <h3>{film.title}</h3>
                    <p className={styles.cardMeta}>
                      {film.category} <i /> {film.year}
                    </p>
                    <p className={styles.cardDescription}>{film.description}</p>
                  </div>
                  <div className={styles.price}>
                    <Icon name="lock" size={17} /> {film.price}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      
      <section className={styles.about} id="sobre">
  <div className={styles.aboutHeader}>
    <p className={styles.sectionEyebrow}>sobre nós</p>

    <h2>
      Criamos para
      <br />
      <em>comunicar.</em>
    </h2>

    <p className={styles.aboutIntro}>
      Produzimos conteúdos audiovisuais que aproximam pessoas, marcas e
      histórias através de uma linguagem visual pensada para cada projecto.
    </p>
  </div>

  <div className={styles.aboutContent}>
    <div className={styles.aboutStatement}>
      <span className={styles.aboutNumber}>  </span>

      <div>
        <h3>Do conceito à imagem final.</h3>

        <p>
          Somos uma equipa de produção audiovisual com experiência em
          cinema, televisão, documentário e publicidade. Desenvolvemos
          projectos para marcas, empresas, instituições e produtores que
          procuram comunicar através de imagens com identidade.
        </p>

        <p>
          Da primeira ideia à última montagem, acompanhamos cada projecto
          de forma próxima, combinando criatividade, produção e rigor para
          criar conteúdos que fazem sentido para quem os vê.
        </p>
      </div>
    </div>

    <div className={styles.aboutServices}>
      <div className={styles.aboutService}>
        <span>01</span>

        <div>
          <h4>Conteúdo</h4>

          <p>
            Documentários, filmes, televisão e conteúdos digitais
            desenvolvidos com uma linguagem própria.
          </p>
        </div>
      </div>

      <div className={styles.aboutService}>
        <span>02</span>

        <div>
          <h4>Publicidade</h4>

          <p>
            Filmes e campanhas para marcas que procuram comunicar de
            forma relevante, criativa e visualmente forte.
          </p>
        </div>
      </div>

      <div className={styles.aboutService}>
        <span>03</span>

        <div>
          <h4>Produção</h4>

          <p>
            Acompanhamos cada projecto de ponta a ponta, da ideia e
            pré-produção à filmagem, montagem e finalização.
          </p>
        </div>
      </div>
    </div>
  </div>

  <div className={styles.aboutFooter}>
    <img src="/logos/ROLL_BRANCO.png" alt="Meu Logo" />

    <p>
      Conteúdo · Publicidade · Televisão · Cinema
    </p>

    <span></span>
  </div>
</section>


      <section className={styles.contact} id="contacto">
  <div className={styles.contactTop}>
    <p className={styles.sectionEyebrow}>vamos conversar</p>

    <span className={styles.contactIndex}></span>
  </div>

  <div className={styles.contactMain}>
    <div className={styles.contactHeadline}>
      <h2>
        Tem uma história?
        <br />
        <em>Conte-nos.</em>
      </h2>

      <p>
        Estamos sempre à procura de novas histórias, parceiros e projectos
        com significado. Se tem uma ideia, um projecto ou simplesmente quer
        saber mais sobre o nosso trabalho, fale connosco.
      </p>
    </div>

    <div className={styles.contactDetails}>
      <a href="mailto:contacto@roll.pt" className={styles.contactItem}>
        <span className={styles.contactLabel}>email</span>
        <span className={styles.contactValue}>contacto@roll.pt</span>
        <span className={styles.contactArrow}>↗</span>
      </a>

      <a href="tel:+351210000000" className={styles.contactItem}>
        <span className={styles.contactLabel}>telefone</span>
        <span className={styles.contactValue}>+351 210 000 000</span>
        <span className={styles.contactArrow}>↗</span>
      </a>

      <div className={styles.contactItem}>
        <span className={styles.contactLabel}>estúdio</span>
        <span className={styles.contactValue}>Ponta do Sol, Madeira</span>
      </div>
    </div>
  </div>

  <div className={styles.contactBottom}>
    <img src="/logos/ROLL_BRANCO.png" alt="Meu Logo" />
    <span>© 2024</span>
  </div>
</section>

      <footer className={styles.footer} id="footer">
        <a className={styles.brand} href="#inicio">
         <img src="/logos/ROLL_CORES.png" alt="Meu Logo" />
        </a>
        <p>© 2024 Roll. Cinema independente, perto de si.</p>
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
