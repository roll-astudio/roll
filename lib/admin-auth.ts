import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

// Garante que quem pede é um administrador; senão redireciona.
// Devolve o cliente Supabase (com a sessão) para ser usado a seguir.
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/");

  return supabase;
}
