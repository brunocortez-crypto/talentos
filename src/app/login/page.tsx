import { LoginForm } from "./login-form";

export default function LoginPage() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0a0a0a] dark:to-[#1a1a1a] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-[#111722] rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Talentos</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestão de Recrutamento e Vendas
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Não tem uma conta?{" "}
            <span className="font-medium">
              Contate o administrador do sistema
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
