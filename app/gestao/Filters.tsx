"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type Option = { value: string; label: string };

export default function Filters({
  producers,
  months,
  producer,
  month,
}: {
  producers: Option[];
  months: Option[];
  producer?: string;
  month?: string;
}) {
  const router = useRouter();

  // Mantém o outro filtro ao mudar um deles
  const go = (next: { producer?: string; month?: string }) => {
    const params = new URLSearchParams();
    if (next.producer) params.set("produtor", next.producer);
    if (next.month) params.set("mes", next.month);
    const query = params.toString();
    router.push(query ? `/gestao?${query}` : "/gestao");
  };

  return (
    <div className={styles.filters}>
      <label className={styles.filter}>
        <span>Produtor</span>
        <select
          value={producer ?? ""}
          onChange={(event) => go({ producer: event.target.value, month })}
        >
          <option value="">Todos</option>
          {producers.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.filter}>
        <span>Mês</span>
        <select
          value={month ?? ""}
          onChange={(event) => go({ producer, month: event.target.value })}
        >
          <option value="">Todos</option>
          {months.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
