"use client";

import Script from "next/script";
import { createElement, useState } from "react";
import styles from "./page.module.css";

type FilmWatchExperienceProps = {
  film: {
    title: string;
    year: string;
    category: string;
    price: string;
    image: string;
    description: string;
    duration: string;
  };
  isOwned: boolean;
};

export default function FilmWatchExperience({ film, isOwned }: FilmWatchExperienceProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroImage} style={{ backgroundImage: `url(${film.image})` }} />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>{film.category} <i /> {film.year}</p>
          <h1 className={styles.title}>{film.title}</h1>
          <p className={styles.lead}>{film.description}</p>
          <div className={styles.actions}>
            {isOwned ? (
              <>
                <button
                  className={styles.watchButton}
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  aria-label={`Começar a ver ${film.title}`}
                >
                  <span className={styles.watchButtonIcon}>▶</span>
                  Ver filme
                </button>
                <button className={styles.iconButton} type="button" aria-label="Adicionar à biblioteca">＋</button>
                <button className={styles.iconButton} type="button" aria-label="Avaliar filme">♡</button>
              </>
            ) : (
              <button className={styles.primary}>Comprar acesso · {film.price}</button>
            )}
            <span className={styles.duration}>{film.duration} <i /> Acesso ilimitado</span>
          </div>
        </div>
      </section>

      {isPlaying && isOwned && (
        <div className={styles.playerFrame}>
          <div className={styles.playerBar}>
            <span>← &nbsp; {film.title}</span>
            <div>
              <button type="button" aria-label="Modo cinema">▣</button>
              <button type="button" aria-label="Fechar filme" onClick={() => setIsPlaying(false)}>×</button>
            </div>
          </div>
          <Script src="https://cdn.jsdelivr.net/npm/@mux/mux-player" strategy="afterInteractive" />
          {createElement("mux-player", {
            class: styles.muxPlayer,
            "playback-id": "EcHgOK9coz5K4rjSwOkoE7Y7O01201YMIC200RI6lNxnhs",
            "metadata-video-title": film.title,
            "metadata-viewer-user-id": "roll-demo-viewer",
            "stream-type": "on-demand",
            playsinline: true,
            preload: "metadata",
          })}
        </div>
      )}
    </>
  );
}
