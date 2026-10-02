"use client";

import Link from "next/link";
import Script from "next/script";
import { createElement, useState } from "react";
import Button from "../../../components/button/Button";
import styles from "./page.module.css";
import type { Film } from "../../../lib/films";
import { useRef } from "react";

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 6 9 6-9 6V6Z" fill="currentColor" />
    </svg>
  );
}

type FilmWatchExperienceProps = {
  film: Film;
  isOwned: boolean;
  autoPlay?: boolean;
};

export default function FilmWatchExperience({
  film,
  isOwned,
  autoPlay = false,
}: FilmWatchExperienceProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay && isOwned);

  const ref = useRef<HTMLDivElement>(null);
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
          {film.producer && (
            <p className={styles.producer}>
              Produzido por{" "}
              <Link href={`/produtor/${film.producer.username}`}>
                {film.producer.name}
              </Link>
            </p>
          )}
          <p className={styles.lead}>{film.description}</p>
          <div className={styles.actions}>
            {isOwned ? (
                <Button
                  variant="primary"
                  type="button"
                  onClick={() => {
                    setIsPlaying(true);
                    requestAnimationFrame(() => {
                      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    });
                  }}
                  aria-label={`Começar a ver ${film.title}`}
                >
                  <PlayIcon /> Ver filme
                </Button>
            ) : (
              <Button variant="primary" href={`/filmes/${film.slug}/comprar`}>
                Comprar acesso · {film.price}
              </Button>
            )}
            <span className={styles.duration}>
              {film.duration} 
            </span>
          </div>
        </div>
      </section>

      {isPlaying && isOwned && (
        <div ref={ref} className={styles.playerFrame}>
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
