"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

export type AuthState = { error?: string; name?: string; email?: string };

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password)
    return { error: "Preenche o email e a palavra-passe.", email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      email,
      error:
        error.code === "email_not_confirmed"
          ? "Confirma o teu email antes de entrar."
          : "Email ou palavra-passe incorretos.",
    };
  }

  redirect("/");
}

export async function register(_: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!name || !email || !password) return { error: "Preenche todos os campos.", name, email };
  if (password.length < 6)
    return {
      error: "A palavra-passe tem de ter pelo menos 6 caracteres.",
      name,
      email,
    };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) {
    return {
      name,
      email,
      error: /registered|already/i.test(error.message)
        ? "Já existe uma conta com este email."
        : "Não foi possível criar a conta. Tenta novamente.",
    };
  }
  if (!data.session) {
    return {
      error: "Conta criada, mas é preciso confirmar o email antes de entrar.",
      name,
      email,
    };
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
