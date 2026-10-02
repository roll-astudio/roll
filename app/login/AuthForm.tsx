"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register, type AuthState } from "./actions";
import Button from "../../components/button/Button";
import styles from "./page.module.css";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const [state, action, pending] = useActionState<AuthState, FormData>(
    isLogin ? login : register,
    {},
  );

  return (
    <form action={action} className={styles.form}>
      <h1 className={styles.title}>
        {isLogin ? "Entrar" : "Criar"} <em>{isLogin ? "na Roll." : "conta."}</em>
      </h1>

      {!isLogin && (
        <label>
          Nome
          <input name="name" type="text" defaultValue={state.name} autoComplete="name" required />
        </label>
      )}
      <label>
        Email
        <input name="email" type="email" defaultValue={state.email} autoComplete="email" required />
      </label>
      <label>
        Palavra-passe
        <input
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          minLength={isLogin ? undefined : 6}
          required
        />
      </label>

      {state.error && <p className={styles.error} role="alert">{state.error}</p>}

      <Button variant="primary" type="submit" disabled={pending} className={styles.submit}>
        {pending ? "A processar…" : isLogin ? "Entrar" : "Criar conta"}
      </Button>

      <p className={styles.switch}>
        {isLogin ? (
          <>Ainda não tens conta? <Link href="/registar">Criar conta</Link></>
        ) : (
          <>Já tens conta? <Link href="/login">Entrar</Link></>
        )}
      </p>
    </form>
  );
}
