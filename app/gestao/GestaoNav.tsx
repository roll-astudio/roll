import Link from "next/link";
import styles from "./page.module.css";

export default function GestaoNav({ active }: { active: "geral" | "utilizadores" | "novo" }) {
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
      <Link
        href="/gestao/filmes/novo"
        className={active === "novo" ? styles.subnavActive : undefined}
      >
        Criar filme
      </Link>
    </nav>
  );
}
