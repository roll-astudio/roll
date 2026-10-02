"use client";

import { useActionState } from "react";
import Button from "../../../components/button/Button";
import type { FilmFormState } from "./actions";
import styles from "./page.module.css";

export default function FilmForm({
  producers,
  formAction,
  initial = {},
  submitLabel,
}: {
  producers: { id: string; name: string }[];
  formAction: (state: FilmFormState, formData: FormData) => Promise<FilmFormState>;
  initial?: Record<string, string>;
  submitLabel: string;
}) {
  const [state, action, pending] = useActionState<FilmFormState, FormData>(
    formAction,
    { values: initial },
  );
  const v = state.values ?? initial;

  return (
    <form action={action} className={styles.form}>
      <label>
        Produtora
        <select name="producer" defaultValue={v.producer ?? ""} required>
          <option value="" disabled>
            Escolhe a produtora
          </option>
          {producers.map((producer) => (
            <option key={producer.id} value={producer.id}>
              {producer.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Nome do filme
        <input name="title" type="text" defaultValue={v.title} required />
      </label>

      <label>
        Preço (€)
        <input
          name="price"
          type="text"
          inputMode="decimal"
          placeholder="12,90"
          defaultValue={v.price}
          required
        />
      </label>

      <label>
        Descrição
        <textarea name="description" rows={4} defaultValue={v.description} required />
      </label>

      <label>
        URL da imagem
        <input
          name="image"
          type="url"
          placeholder="https://…"
          defaultValue={v.image}
          required
        />
      </label>

      <label>
        URL do vídeo no Mux
        <input
          name="video"
          type="url"
          placeholder="https://stream.mux.com/…"
          defaultValue={v.video}
          required
        />
      </label>

      {state.error && (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      )}

      <div>
        <Button variant="primary" type="submit" disabled={pending}>
          {pending ? "A guardar…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
