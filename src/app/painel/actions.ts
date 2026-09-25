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

  // Query base sem joins (mais rápido e menos problemas de RLS)
  let query = supabase
    .from("vagas")
    .select("*")
    .order("data_abertura", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data: vagas, error } = await query;
  if (error) {
    console.error("Erro ao carregar vagas:", error);
    return [];
  }

  if (!vagas || vagas.length === 0) return [];

  // Fazer joins manualmente no JavaScript
  const clienteIds = [...new Set(vagas.map(v => v.cliente_id))];
  const analistaIds = [...new Set(vagas.filter(v => v.analista_id).map(v => v.analista_id))];
  const projetoIds = [...new Set(vagas.map(v => v.projeto_id))];

  const [clientesRes, analistasRes, projetosRes] = await Promise.all([
    supabase.from("clientes").select("id, nome").in("id", clienteIds),
    supabase.from("analistas").select("id, nome").in("id", analistaIds),
    supabase.from("projetos").select("id, nome").in("id", projetoIds),
  ]);

  const clientesMap = new Map((clientesRes.data || []).map(c => [c.id, c.nome]));
  const analistasMap = new Map((analistasRes.data || []).map(a => [a.id, a.nome]));
  const projetosMap = new Map((projetosRes.data || []).map(p => [p.id, p.nome]));

  // Enriquecer vagas com dados dos joins
  const vagasEnriquecidas = vagas.map(v => ({
    ...v,
    clientes: { nome: clientesMap.get(v.cliente_id) || "" },
    analistas: v.analista_id ? { nome: analistasMap.get(v.analista_id) || "" } : null,
    projetos: { nome: projetosMap.get(v.projeto_id) || "" },
  }));

  // Filtrar no JavaScript se necessário
  let resultado = vagasEnriquecidas;
  if (projeto) resultado = resultado.filter(v => v.projetos.nome === projeto);
  if (analista) resultado = resultado.filter(v => v.analistas?.nome === analista);
  if (cliente) resultado = resultado.filter(v => v.clientes.nome === cliente);

  return resultado;
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
