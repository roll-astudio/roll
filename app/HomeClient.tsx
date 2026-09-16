"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import Button from "../components/button/Button";
import Card from "../components/card/Card";
import Footer from "../components/footer/Footer";
import SiteHeader from "../components/site-header/SiteHeader";
import type { Film } from "../lib/films";

function Icon({
  name,
  size = 20,
}: {
  name:
    | "play"
    | "info"
    | "search"
    | "user"
    | "menu"
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
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
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

export default function HomeClient({ films }: { films: Film[] }) {
  const [notice, setNotice] = useState("");
  const [catalogFiltersOpen, setCatalogFiltersOpen] = useState(false);
  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };
  return (
    <main className={styles.page}>
      <SiteHeader onSearch={() => notify("A pesquisa estará disponível em breve")} />
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
            <Button
              className={styles.primary}
              onClick={() => notify("O filme vai começar em breve")}
            >
              <Icon name="play" size={16} /> Ver agora
            </Button>
            <Button
              className={styles.secondary}
              onClick={() => notify("Mais detalhes em breve")}
            >
              <Icon name="info" size={17} /> Saber mais
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.catalog} id="catalogo">
        <div className={styles.catalogHead}>
          <Button
            className={styles.catalogMenuButton}
            aria-label="Abrir filtros do catálogo"
            aria-expanded={catalogFiltersOpen}
            onClick={() => setCatalogFiltersOpen((open) => !open)}
          >
            <Icon name="menu" size={18} />
          </Button>
          <div>
            <p className={styles.sectionEyebrow}>Roll / catálogo</p>
            <h2>
              Histórias que <em>ficam.</em>
            </h2>
          </div>
          <div
            className={`${styles.filters} ${catalogFiltersOpen ? styles.catalogFiltersOpen : ""}`}
          >
            <Button className={styles.filterActive}>Todos</Button>
            <Button>Documentários</Button>
            <Button>Ficção</Button>
            <Button
              className={styles.sort}
              onClick={() => notify("A ordenar pelos mais recentes")}
            >
              Mais recentes <span>⌄</span>
            </Button>
          </div>
        </div>
        <div className={styles.grid}>
          {films.map((film) => (
            <Link
              className={styles.cardLink}
              key={film.slug}
              href={`/filmes/${film.slug}`}
            >
              <Card className={styles.card}>
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
              </Card>
            </Link>
          ))}
        </div>
      </section>


<section className={styles.about} id="sobre">
  <div className={styles.aboutHeader}>

    <div className={styles.aboutTop}>
      <p className={styles.sectionEyebrow}>sobre nós</p>
      <span className={styles.aboutLine}></span>
    </div>

    <div className={styles.aboutMain}>
      <h2>
        Damos espaço a histórias <br /> <em>independentes.</em>
      </h2>

      <p className={styles.aboutIntro}>
        A Roll é uma estrutura dedicada à distribuição e comercialização de
        conteúdos audiovisuais, aproximando filmes e projectos independentes
        do público e do mercado.
      </p>
    </div>

  </div>

  <div className={styles.aboutContent}>
    <div className={styles.aboutStatement}>
      <span className={styles.aboutNumber}> </span>

      <div>
        <h3>A aStudio cria. A Roll faz chegar mais longe.</h3>

        <p>
          Trabalhamos com conteúdos produzidos pela aStudio e com produtores
          independentes que procuram novas formas de apresentar e comercializar
          os seus trabalhos.
        </p>

        <p>
          Através da Roll, filmes, documentários e outros conteúdos audiovisuais
          podem encontrar novos públicos e oportunidades de distribuição,
          criando uma ponte entre quem produz e quem procura novas histórias.
        </p>
      </div>
    </div>

    <div className={styles.aboutServices}>
      <div className={styles.aboutService}>
        <span>01</span>

        <div>
          <h4>Produção</h4>

          <p>
            A aStudio desenvolve e produz conteúdos audiovisuais para diferentes
            formatos e públicos.
          </p>
        </div>
      </div>

      <div className={styles.aboutService}>
        <span>02</span>

        <div>
          <h4>Distribuição</h4>

          <p>
            A Roll disponibiliza e promove conteúdos da aStudio e de produtores
            independentes, aproximando-os de novos públicos.
          </p>
        </div>
      </div>

      <div className={styles.aboutService}>
        <span>03</span>

        <div>
          <h4>Comercialização</h4>

          <p>
            Criamos oportunidades para que conteúdos independentes possam
            chegar ao mercado e ser comercializados.
          </p>
        </div>
      </div>
    </div>
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
              com significado. Se tem uma ideia, um projecto ou simplesmente
              quer saber mais sobre o nosso trabalho, fale connosco.
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
      </section>

      <Footer id="footer">
        <div className={styles.footerTop}>
          <div className={styles.footerIntro}>
            <a
              className={styles.footerBrand}
              href="#inicio"
              aria-label="Roll — voltar ao início"
            >
              <Image src="/logos/ROLL_CORES.png" alt="Roll" width={160} height={65} />
            </a>
            <p>Filmes com tempo, intenção e espaço para ficar.</p>
          </div>

          <div className={styles.footerColumn}>
            <span className={styles.footerLabel}>explorar</span>
            <a href="#catalogo">Catálogo</a>
            <a href="#sobre">Sobre nós</a>
            <a href="#contacto">Contacto</a>
          </div>

          <div className={styles.footerColumn}>
            <span className={styles.footerLabel}>fale connosco</span>
            <a href="mailto:contacto@roll.pt">contacto@roll.pt</a>
            <span>Ponta do Sol, Madeira</span>
          </div>

          <div className={styles.footerColumn}>
            <span className={styles.footerLabel}>acompanhe</span>
            <div className={styles.socials}>
              <a href="#footer" aria-label="Instagram">
                <Icon name="instagram" size={17} />
              </a>
              <a href="#footer" aria-label="Facebook">
                <Icon name="facebook" size={17} />
              </a>
              <a href="#footer" aria-label="Vimeo">
                <Icon name="vimeo" size={19} />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>© 2024 Roll</span>
          <span>Cinema independente, perto de si.</span>
          <a href="#inicio">
            Voltar ao início <span aria-hidden="true">↗</span>
          </a>
        </div>
      </Footer>
      {notice && <div className={styles.toast}>{notice}</div>}
    </main>
  );
}
