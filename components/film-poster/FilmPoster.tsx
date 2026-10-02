import type { ReactNode } from "react";
import styles from "./FilmPoster.module.css";

type FilmPosterProps = {
  image: string;
  title: string;
  badge?: ReactNode;
  className?: string;
};

// Capa limpa 2:3, sem texto por cima. O texto vai sempre numa superfície sólida ao lado.
export default function FilmPoster({ image, title, badge, className }: FilmPosterProps) {
  return (
    <div
      className={[styles.poster, className].filter(Boolean).join(" ")}
      style={{ backgroundImage: `url(${image})` }}
      role="img"
      aria-label={`Capa de ${title}`}
    >
      {badge && <span className={styles.badge}>{badge}</span>}
    </div>
  );
}
