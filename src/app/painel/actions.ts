"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateVagaStatus(vagaId: string, novoStatus: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("vagas")
    .update({ status: novoStatus })
    .eq("id", vagaId);

  if (error) throw error;
  revalidatePath("/painel/vagas");
}

export async function getVagasComFiltros(
  projeto?: string,
  analista?: string,
  cliente?: string,
  status?: string
) {
  const supabase = await createClient();
  let query = supabase
    .from("vagas")
    .select(
      "*, clientes(nome), analistas(nome), projetos(nome), receitas_fixas(valor)"
    )
    .order("data_abertura", { ascending: false });

  if (projeto) query = query.eq("projetos.nome", projeto);
  if (analista) query = query.eq("analistas.nome", analista);
  if (cliente) query = query.eq("clientes.nome", cliente);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getEstatisticas() {
  const supabase = await createClient();
  const { data } = await supabase.from("vagas").select("status, receita");

  if (!data) return null;

  const stats = {
    total: data.length,
    aberta: data.filter((v) => v.status === "aberta").length,
    faturar: data.filter((v) => v.status === "faturar").length,
    concluida: data.filter((v) => v.status === "concluida").length,
    cancelada: data.filter((v) => v.status === "cancelada").length,
    receitaTotal: data.reduce((acc, v) => acc + (v.receita || 0), 0),
    receitaAberta: data
      .filter((v) => v.status === "aberta")
      .reduce((acc, v) => acc + (v.receita || 0), 0),
  };

  return stats;
}
