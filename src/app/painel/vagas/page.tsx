"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { KanbanColumn } from "@/components/kanban-column";
import { updateVagaStatus, getVagasComFiltros } from "../actions";
import { ChevronDown, Search } from "lucide-react";

interface Vaga {
  id: string;
  cliente_id: string;
  clientes: { nome: string };
  cargo: string;
  receita: number;
  data_abertura: string;
  analista_id?: string;
  analistas?: { nome: string };
  quantidade: number;
  status: "aberta" | "faturar" | "concluida" | "substituicao" | "congelada" | "cancelada";
  projetos: { nome: string };
}

const statusPorOrdem = [
  { id: "aberta", titulo: "Abertas", cor: "green" },
  { id: "faturar", titulo: "Para Faturar", cor: "yellow" },
  { id: "concluida", titulo: "Concluídas", cor: "blue" },
  { id: "cancelada", titulo: "Canceladas", cor: "red" },
] as const;

export default function VagasPage() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [filtros, setFiltros] = useState({
    projeto: "",
    analista: "",
    cliente: "",
  });
  const [loading, setLoading] = useState(true);
  const [projetos, setProjetos] = useState<string[]>([]);
  const [analistas, setAnalistas] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  const carregarVagas = useCallback(async () => {
    setLoading(true);
    try {
      const dados = await getVagasComFiltros(
        filtros.projeto || undefined,
        filtros.analista || undefined,
        filtros.cliente || undefined
      );
      setVagas(dados || []);

      // Extrair projetos e analistas únicos
      const projsUnicos = [...new Set((dados || []).map((v) => v.projetos.nome))];
      const analistasUnicos = [
        ...new Set((dados || []).filter((v) => v.analistas).map((v) => v.analistas!.nome)),
      ];
      setProjetos(projsUnicos);
      setAnalistas(analistasUnicos);
    } catch (error) {
      console.error("Erro ao carregar vagas:", error);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    carregarVagas();
  }, [carregarVagas]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const vagaId = active.id as string;
    const novoStatus = over.id as string;

    if (novoStatus === "aberta" || novoStatus === "faturar" || novoStatus === "concluida" || novoStatus === "cancelada") {
      try {
        await updateVagaStatus(vagaId, novoStatus);
        setVagas((prev) =>
          prev.map((v) =>
            v.id === vagaId ? { ...v, status: novoStatus as any } : v
          )
        );
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
      }
    }
  };

  const vagasPorStatus = {
    aberta: vagas.filter((v) => v.status === "aberta"),
    faturar: vagas.filter((v) => v.status === "faturar"),
    concluida: vagas.filter((v) => v.status === "concluida"),
    cancelada: vagas.filter((v) => v.status === "cancelada"),
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vagas</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie suas vagas em tempo real
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          + Nova Vaga
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Projeto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Projeto
            </label>
            <select
              value={filtros.projeto}
              onChange={(e) => setFiltros((prev) => ({ ...prev, projeto: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Todos os projetos</option>
              {projetos.map((proj) => (
                <option key={proj} value={proj}>
                  {proj}
                </option>
              ))}
            </select>
          </div>

          {/* Analista */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Analista
            </label>
            <select
              value={filtros.analista}
              onChange={(e) => setFiltros((prev) => ({ ...prev, analista: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Todas as analistas</option>
              {analistas.map((anal) => (
                <option key={anal} value={anal}>
                  {anal}
                </option>
              ))}
            </select>
          </div>

          {/* Buscar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar Cliente
            </label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Digite um cliente..."
                value={filtros.cliente}
                onChange={(e) => setFiltros((prev) => ({ ...prev, cliente: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Botão Limpar Filtros */}
        {(filtros.projeto || filtros.analista || filtros.cliente) && (
          <button
            onClick={() => setFiltros({ projeto: "", analista: "", cliente: "" })}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Carregando vagas...</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {statusPorOrdem.map(({ id, titulo }) => (
              <KanbanColumn
                key={id}
                status={id as any}
                titulo={titulo}
                vagas={vagasPorStatus[id as keyof typeof vagasPorStatus]}
                cor={id}
              />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}
