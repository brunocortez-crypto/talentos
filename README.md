# Talentos - Sistema de Gestão de Recrutamento e CRM de Vendas

Sistema web em nuvem para consolidar vagas de recrutamento, gestão de empresas clientes, pipeline de vendas e faturamento.

## 🚀 Stack Tecnológico

- **Frontend:** Next.js 15+, React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL) com RLS
- **Auth:** Supabase Auth (email/password)
- **Deploy:** Vercel
- **Validação:** Zod

## 🔧 Setup Inicial

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase

#### Criar o Projeto
1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Copie as credenciais:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY` (service role)

#### Criar as Tabelas

Na console Supabase, acesse **SQL Editor** e execute o script de setup:

```bash
# Ver: docs/DATABASE_SCHEMA.sql
```

### 3. Configurar Variáveis de Ambiente

Crie `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SECRET_KEY=eyJ...
```

### 4. Criar Primeiro Usuário

Na console Supabase:

1. Vá para **Authentication** → **Users**
2. Clique **Add User**
3. Email: seu.email@example.com
4. Password: senhaSegura123!

### 5. Executar Localmente

```bash
npm run dev
```

Acesse `http://localhost:3000` → será redirecionado para `/login`

## 📁 Estrutura de Pastas

```
talentos/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── login/            # Página de login
│   │   ├── painel/           # Dashboard (protegido)
│   │   ├── globals.css       # Tailwind + tema
│   │   ├── layout.tsx        # Root layout
│   │   └── theme-provider.tsx # Dark mode
│   ├── lib/
│   │   ├── supabase/         # Clients (browser, server, admin)
│   │   ├── auth/             # Auth utilities
│   │   └── utils/            # Helpers
│   └── components/           # Componentes reutilizáveis
├── .env.local                # Credenciais (NÃO VERSIONAR)
└── package.json
```

## 🔐 Segurança

- Credenciais em `.env.local` (nunca commitar)
- RLS habilitada em todas as tabelas
- Validação de auth via cookies Supabase
- Funções server-only para operações sensíveis

## 📊 Tabelas do Banco

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Usuários do sistema |
| `empresas` | Empresas clientes |
| `vagas` | Vagas abertas |
| `contatos` | Contatos CRM |
| `interacoes` | Histórico de contato |
| `oportunidades` | Pipeline de vendas |
| `faturamento` | Registros de faturamento |

## 🚀 Roadmap

- ✅ Setup inicial
- ⏳ CRUD de vagas e empresas
- ⏳ Dashboard com cards
- ⏳ CRM: Pipeline de vendas
- ⏳ Faturamento consolidado
- ⏳ Integração com Indeed
- ⏳ Agendamento de entrevistas
