import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../lib/supabase/server";

// Ícone do utilizador: vai para a página do utilizador ou para o login.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const path = data.user ? `/utilizador/${data.user.id}` : "/login";
  return NextResponse.redirect(new URL(path, request.url));
}
