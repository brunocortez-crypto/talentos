# Talentos - Sistema de Gestão de Recrutamento e CRM de Vendas

Sistema web em nuvem para consolidar vagas de recrutamento, gestão de empresas clientes, pipeline de vendas e faturamento.

## 🚀 Stack Tecnológico

- **Frontend:** Next.js 15+, React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL) com RLS
- **Auth:** Supabase Auth (email/password)
- **Deploy:** Vercel
- **Validação:** Zod

## 🚀 Rodando em Nuvem

A aplicação está **100% em nuvem**:
- 🌍 Frontend: https://talentos.vercel.app
- 🗄️ Banco: Supabase (PostgreSQL)
- 🔐 Auth: Supabase Auth

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
├── docs/
│   ├── DATABASE_SCHEMA.sql   # Script de criação do banco
│   └── SETUP_GUIDE.md        # Guia de setup
└── package.json
```

## 🔐 Segurança

- RLS habilitada em todas as tabelas
- Validação de auth via cookies Supabase
- Funções server-only para operações sensíveis
- Chaves de API seguras (não versionadas)

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
- ✅ Infraestrutura em nuvem (Vercel + Supabase)
- ⏳ CRUD de vagas e empresas
- ⏳ Dashboard com cards
- ⏳ CRM: Pipeline de vendas
- ⏳ Faturamento consolidado
- ⏳ Integração com Indeed
- ⏳ Agendamento de entrevistas
