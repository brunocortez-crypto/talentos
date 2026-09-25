"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { VagaCard } from "./vaga-card";

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

interface KanbanColumnProps {
  status: "aberta" | "faturar" | "concluida" | "substituicao" | "congelada" | "cancelada";
  titulo: string;
  vagas: Vaga[];
  cor: string;
}

export function KanbanColumn({ status, titulo, vagas, cor }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });

  const cores = {
    aberta: "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700",
    faturar: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700",
    concluida: "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700",
    substituicao: "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700",
    congelada: "bg-gray-100 dark:bg-gray-900/30 border-gray-300 dark:border-gray-700",
    cancelada: "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700",
  };

  const totalReceita = vagas.reduce((acc, v) => acc + (v.receita || 0), 0);

  return (
    <div className={`rounded-lg border-2 ${cores[status]} p-4 min-h-screen flex flex-col`}>
      {/* Cabeçalho */}
      <div className="mb-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{titulo}</h3>
        <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <p>{vagas.length} vaga{vagas.length !== 1 ? "s" : ""}</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            R$ {totalReceita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Colunas com vagas */}
      <div
        ref={setNodeRef}
        className="flex-1 space-y-3 bg-white dark:bg-slate-800/50 rounded-lg p-3 min-h-96"
      >
        <SortableContext
          items={vagas.map((v) => v.id)}
          strategy={verticalListSortingStrategy}
        >
          {vagas.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500">
              <p>Nenhuma vaga</p>
            </div>
          ) : (
            vagas.map((vaga) => (
              <VagaCard
                key={vaga.id}
                id={vaga.id}
                cliente={vaga.clientes.nome}
                cargo={vaga.cargo}
                receita={vaga.receita}
                dataAbertura={vaga.data_abertura}
                analista={vaga.analistas?.nome}
                quantidade={vaga.quantidade}
                status={vaga.status}
                projeto={vaga.projetos.nome}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
