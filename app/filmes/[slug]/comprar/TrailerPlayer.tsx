"use client";

import Script from "next/script";
import { createElement } from "react";
import styles from "./page.module.css";

// Trailer do Mux: público, sem tokens nem DRM
export default function TrailerPlayer({
  playbackId,
  title,
}: {
  playbackId: string;
  title: string;
}) {
  return (
    <div className={styles.trailerFrame}>
      <Script
        src="https://cdn.jsdelivr.net/npm/@mux/mux-player"
        strategy="afterInteractive"
      />
      {createElement("mux-player", {
        class: styles.trailerPlayer,
        "playback-id": playbackId,
        "metadata-video-title": `Trailer — ${title}`,
        "stream-type": "on-demand",
        playsinline: true,
        preload: "metadata",
      })}
    </div>
  );
}
