"use client";

import Script from "next/script";
import { createElement, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import type { Film } from "../../../lib/films";

type FilmWatchExperienceProps = {
  film: Film;
  isOwned: boolean;
};

export default function FilmWatchExperience({
  film,
  isOwned,
}: FilmWatchExperienceProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPlaying) {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isPlaying]);

  return (
    <>
      <section className={styles.hero}>
        <div
          className={styles.heroImage}
          style={{ backgroundImage: `url(${film.image})` }}
        />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>
            {film.category} <i /> {film.year}
          </p>
          <h1 className={styles.title}>{film.title}</h1>
          <p className={styles.lead}>{film.description}</p>
          <div className={styles.actions}>
            {isOwned ? (
                <button
                  className={styles.watchButton}
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  aria-label={`Começar a ver ${film.title}`}
                >
                  <span className={styles.watchButtonIcon}>▶</span>
                  Ver filme
                </button>
            ) : (
              <button className={styles.primary}>
                Comprar acesso · {film.price}
              </button>
            )}
            <span className={styles.duration}>
              {film.duration} 
            </span>
          </div>
        </div>
      </section>

      {isPlaying && isOwned && (
        <div ref={playerRef} className={styles.playerFrame}>
          <div className={styles.playerBar}>
            <span>← &nbsp; {film.title}</span>
            <div>
              <button type="button" aria-label="Modo cinema">
                ▣
              </button>
              <button
                type="button"
                aria-label="Fechar filme"
                onClick={() => setIsPlaying(false)}
              >
                ×
              </button>
            </div>
          </div>
          <Script
            src="https://cdn.jsdelivr.net/npm/@mux/mux-player"
            strategy="afterInteractive"
          />
          {createElement("mux-player", {
            class: styles.muxPlayer,
            "playback-id": "RXhvaQVhJT94aM1h7dPnPDbXbG5XjgguK5D6Md1hqRY",
            "metadata-video-title": "SPOT 3_",
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
