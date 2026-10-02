import Link from "next/link";
import styles from "./page.module.css";

export default function GestaoNav({ active }: { active: "geral" | "utilizadores" }) {
  return (
    <nav className={styles.subnav} aria-label="Gestão">
      <Link href="/gestao" className={active === "geral" ? styles.subnavActive : undefined}>
        Produtoras
      </Link>
      <Link
        href="/gestao/utilizadores"
        className={active === "utilizadores" ? styles.subnavActive : undefined}
      >
        Utilizadores
      </Link>
    </nav>
  );
}
