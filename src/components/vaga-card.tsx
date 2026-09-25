"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Briefcase, DollarSign, Calendar, User } from "lucide-react";

interface VagaCardProps {
  id: string;
  cliente: string;
  cargo: string;
  receita: number;
  dataAbertura: string;
  analista?: string;
  quantidade: number;
  status: "aberta" | "faturar" | "concluida" | "substituicao" | "congelada" | "cancelada";
  projeto: string;
}

const statusCores = {
  aberta: "border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950",
  faturar: "border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950",
  concluida: "border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950",
  substituicao: "border-l-4 border-l-purple-500 bg-purple-50 dark:bg-purple-950",
  congelada: "border-l-4 border-l-gray-500 bg-gray-50 dark:bg-gray-950",
  cancelada: "border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950",
};

const statusTextos = {
  aberta: "Aberta",
  faturar: "Para Faturar",
  concluida: "Concluída",
  substituicao: "Substituição",
  congelada: "Congelada",
  cancelada: "Cancelada",
};

export function VagaCard(props: VagaCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const data = new Date(props.dataAbertura);
  const dataFormatada = data.toLocaleDateString("pt-BR");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${statusCores[props.status]} rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-3 bg-white dark:bg-slate-900`}
    >
      {/* Cabeçalho com grip e status */}
      <div className="flex items-start justify-between gap-2">
        <div {...attributes} {...listeners} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <GripVertical size={18} />
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          props.status === "aberta"
            ? "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200"
            : props.status === "faturar"
            ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            : props.status === "concluida"
            ? "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
        }`}>
          {statusTextos[props.status]}
        </span>
      </div>

      {/* Cliente */}
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {props.cliente}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{props.projeto}</p>
      </div>

      {/* Cargo */}
      <div className="flex items-start gap-2">
        <Briefcase size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{props.cargo}</p>
      </div>

      {/* Quantidade */}
      {props.quantidade > 1 && (
        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
          {props.quantidade} vagas
        </div>
      )}

      {/* Receita */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <DollarSign size={16} className="text-green-600 dark:text-green-400 flex-shrink-0" />
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          R$ {props.receita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Data e Analista */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>{dataFormatada}</span>
        </div>
        {props.analista && (
          <div className="flex items-center gap-1 truncate">
            <User size={14} />
            <span className="truncate">{props.analista}</span>
          </div>
        )}
      </div>
    </div>
  );
}
