"use client";

import Script from "next/script";
import { createElement } from "react";
import { useState } from "react";
import styles from "./page.module.css";

export default function MuxDemoPlayer({ duration }: { duration: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isPlaying) {
    return (
      <button
        className={styles.watchCta}
        type="button"
        onClick={() => setIsPlaying(true)}
        aria-label="Começar a ver Fora de Jogo"
      >
        <span className={styles.watchPlayIcon}>▶</span>
      </button>
    );
  }

  return (
    <div className={styles.playerFrame}>
      <Script
        src="https://cdn.jsdelivr.net/npm/@mux/mux-player"
        strategy="afterInteractive"
      />
      {createElement("mux-player", {
        class: styles.muxPlayer,
        "playback-id": "EcHgOK9coz5K4rjSwOkoE7Y7O01201YMIC200RI6lNxnhs",
        "metadata-video-title": "Fora de Jogo",
        "metadata-viewer-user-id": "roll-demo-viewer",
        "stream-type": "on-demand",
        playsinline: true,
        preload: "metadata",
      })}
    </div>
  );
}
