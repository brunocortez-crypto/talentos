import { getCurrentProfile } from "@/lib/auth/current-profile";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { TrendingUp, CheckCircle, AlertCircle, DollarSign } from "lucide-react";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  if (!profile) {
    return <div>Carregando...</div>;
  }

  const { data: vagas } = await supabase.from("vagas").select("status, receita");
  const { data: clientes } = await supabase.from("clientes").select("id");

  const stats = {
    vagasAbertas: vagas?.filter((v) => v.status === "aberta").length || 0,
    vagasConcluidas: vagas?.filter((v) => v.status === "concluida").length || 0,
    receitaTotal:
      vagas?.reduce((acc, v) => acc + (v.receita || 0), 0).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) || "R$ 0,00",
    clientesTotais: clientes?.length || 0,
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Bem-vinda, {profile.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sistema de gestão de recrutamento e CRM de vendas
          </p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card: Vagas Abertas */}
        <Link href="/painel/vagas">
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl shadow-lg p-6 border border-green-200 dark:border-green-700 hover:shadow-xl transition-all cursor-pointer transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                  Vagas Abertas
                </p>
                <p className="text-4xl font-bold text-green-700 dark:text-green-300">
                  {stats.vagasAbertas}
                </p>
              </div>
              <AlertCircle size={48} className="text-green-500 opacity-20" />
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-4">
              Clique para gerenciar →
            </p>
          </div>
        </Link>

        {/* Card: Vagas Concluídas */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                Vagas Concluídas
              </p>
              <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                {stats.vagasConcluidas}
              </p>
            </div>
            <CheckCircle size={48} className="text-blue-500 opacity-20" />
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-4">
            {Math.round(
              ((stats.vagasConcluidas /
                (stats.vagasAbertas + stats.vagasConcluidas || 1)) *
                100) as any
            )}% da meta
          </p>
        </div>

        {/* Card: Receita Total */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl shadow-lg p-6 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                Receita Total
              </p>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                R$ {stats.receitaTotal}
              </p>
            </div>
            <DollarSign size={48} className="text-purple-500 opacity-20" />
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-4">
            Da planilha importada
          </p>
        </div>

        {/* Card: Clientes */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl shadow-lg p-6 border border-orange-200 dark:border-orange-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">
                Clientes
              </p>
              <p className="text-4xl font-bold text-orange-700 dark:text-orange-300">
                {stats.clientesTotais}
              </p>
            </div>
            <TrendingUp size={48} className="text-orange-500 opacity-20" />
          </div>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-4">
            Base de dados ativa
          </p>
        </div>
      </div>

      {/* Seção de Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-8">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🚀</div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Seu Sistema Está Pronto!
            </h2>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span> 1.123 vagas importadas da planilha
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span> 228 clientes cadastrados
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span> 8 analistas configuradas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">→</span>
                <Link href="/painel/vagas" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Clique aqui para ver o Kanban com drag-and-drop
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
