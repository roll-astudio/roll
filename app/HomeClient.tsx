"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import Button from "../components/button/Button";
import Card from "../components/card/Card";
import FilmPoster from "../components/film-poster/FilmPoster";
import SiteFooter from "../components/site-footer/SiteFooter";
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
    | "lock"
    | "check"
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
    check: <path d="m5 12.5 4.5 4.5L19 7" />,
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

export default function HomeClient({
  films,
  featured,
  ownedSlugs,
}: {
  films: Film[];
  featured: Film | null;
  ownedSlugs: string[];
}) {
  const [notice, setNotice] = useState("");
  const [catalogFiltersOpen, setCatalogFiltersOpen] = useState(false);
  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };
  return (
    <main className={styles.page}>
      <SiteHeader />
      {featured && (
        <section className={styles.hero} id="inicio">
          <div
            className={styles.heroImage}
            style={{ backgroundImage: `url("${featured.image}")` }}
          />
          <FilmPoster
            className={styles.heroPoster}
            image={featured.image}
            title={featured.title}
          />
          <div className={styles.heroContent}>
            <p className={styles.kicker}>
              <span /> Em destaque
            </p>
            <h1>{featured.title}</h1>
            <div className={styles.meta}>
              <span>{featured.category}</span>
              <i /> <span>{featured.year}</span>
              <i /> <span>{featured.duration}</span>
            </div>
            <p className={styles.description}>{featured.description}</p>
            <div className={styles.heroActions}>
              {ownedSlugs.includes(featured.slug) ? (
                <Button variant="primary" href={`/filmes/${featured.slug}?ver=1`}>
                  <Icon name="play" size={16} /> Ver filme
                </Button>
              ) : (
                <Button variant="primary" href={`/filmes/${featured.slug}/comprar`}>
                  <Icon name="lock" size={16} /> Comprar · {featured.price}
                </Button>
              )}
              <Button variant="secondary" href={`/filmes/${featured.slug}`}>
                <Icon name="info" size={17} /> Saber mais
              </Button>
            </div>
          </div>
        </section>
      )}

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
                <FilmPoster
                  className={styles.poster}
                  image={film.image}
                  title={film.title}
                />
                <div className={styles.cardBody}>
                  <h3>{film.title}</h3>
                  <p className={styles.cardMeta}>
                    {film.category} <i /> {film.year} <i /> {film.duration}
                  </p>
                  {ownedSlugs.includes(film.slug) ? (
                    <div className={`${styles.price} ${styles.owned}`}>
                      <Icon name="check" size={16} /> Comprado
                    </div>
                  ) : (
                    <div className={styles.price}>
                      <Icon name="lock" size={16} /> {film.price}
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>





      

      <SiteFooter />
      {notice && <div className={styles.toast}>{notice}</div>}
    </main>
  );
}
