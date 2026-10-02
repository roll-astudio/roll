"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function MonthFilter({
  id,
  months,
  selected,
}: {
  id: string;
  months: { value: string; label: string }[];
  selected?: string;
}) {
  const router = useRouter();

  return (
    <label className={styles.filter}>
      <span>Mês</span>
      <select
        value={selected ?? ""}
        onChange={(event) =>
          router.push(
            event.target.value
              ? `/admin/${id}?mes=${event.target.value}`
              : `/admin/${id}`,
          )
        }
      >
        <option value="">Todos</option>
        {months.map((month) => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </select>
    </label>
  );
}
