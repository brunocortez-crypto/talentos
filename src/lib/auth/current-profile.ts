import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface CurrentProfile {
  id: string;
  email: string;
  name: string;
  role: "admin" | "recruiter" | "gerente" | "visualizador";
  empresa: string;
  ativo: boolean;
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, name, role, empresa, ativo")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Erro ao buscar perfil:", error);
    return null;
  }

  return profile as CurrentProfile;
}
