import { getCurrentProfile } from "@/lib/auth/current-profile";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">
        Bem-vinda, {profile.name.split(" ")[0]}! 👋
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Sistema de gestão de recrutamento e CRM de vendas
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card: Vagas */}
        <div className="bg-white dark:bg-[#111722] rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Vagas Abertas
          </h2>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Aguardando dados
          </p>
        </div>

        {/* Card: Faturamento */}
        <div className="bg-white dark:bg-[#111722] rounded-lg shadow p-6 border-l-4 border-green-500">
          <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Faturamento Total
          </h2>
          <p className="text-3xl font-bold">R$ 0,00</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Este mês
          </p>
        </div>

        {/* Card: Oportunidades */}
        <div className="bg-white dark:bg-[#111722] rounded-lg shadow p-6 border-l-4 border-purple-500">
          <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Oportunidades
          </h2>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Em pipeline
          </p>
        </div>

        {/* Card: Contatos */}
        <div className="bg-white dark:bg-[#111722] rounded-lg shadow p-6 border-l-4 border-orange-500">
          <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Contatos
          </h2>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Cadastrados
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">🚀 Próximos Passos</h2>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>✅ Infraestrutura base criada</li>
          <li>📋 Configure o banco de dados com as credenciais Supabase</li>
          <li>👥 Crie as primeiras empresas e vagas</li>
          <li>💼 Configure seu CRM de vendas</li>
          <li>📊 Acompanhe faturamento em tempo real</li>
        </ul>
      </div>
    </div>
  );
}
