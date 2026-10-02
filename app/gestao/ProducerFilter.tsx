"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function ProducerFilter({
  producers,
  selected,
}: {
  producers: { id: string; name: string }[];
  selected?: string;
}) {
  const router = useRouter();

  return (
    <label className={styles.filter}>
      <span>Produtor</span>
      <select
        value={selected ?? ""}
        onChange={(event) =>
          router.push(
            event.target.value ? `/gestao?produtor=${event.target.value}` : "/gestao",
          )
        }
      >
        <option value="">Todos</option>
        {producers.map((producer) => (
          <option key={producer.id} value={producer.id}>
            {producer.name}
          </option>
        ))}
      </select>
    </label>
  );
}
