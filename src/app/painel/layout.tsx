import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/app/theme-provider";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  // Protege a rota - redireciona para login se não autenticado
  if (!data.user) {
    redirect("/login");
  }

  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-white dark:bg-[#111722] border-b border-gray-200 dark:border-white/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Talentos</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Olá, {profile.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Sidebar + Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-[#111722] border-r border-gray-200 dark:border-white/5 p-6">
          <nav className="space-y-2">
            <a
              href="/painel"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              Dashboard
            </a>
            <a
              href="/painel/vagas"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              Vagas
            </a>
            <a
              href="/painel/empresas"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              Empresas
            </a>
            <a
              href="/painel/crm"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              CRM
            </a>
            <a
              href="/painel/faturamento"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              Faturamento
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
