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
├── supabase/migrations/      # SQL do banco, em ordem (rodar no SQL Editor)
├── scripts/
│   └── importar_planilha.py  # Gera o SQL de carga a partir da BD_Talentos.xlsx
├── docs/
│   └── SETUP_GUIDE.md        # Guia de setup
└── package.json
```

## 📥 Importar a planilha

```bash
python scripts/importar_planilha.py BD_Talentos.xlsx importa_planilha.sql
```

Rode o SQL gerado no SQL Editor do Supabase. Pode repetir com a planilha atualizada: ele recarrega só as vagas que vieram da planilha. A planilha e o SQL gerado têm dados de clientes e candidatos, então não vão para o repositório.

## 🔐 Segurança

- RLS habilitada em todas as tabelas
- Validação de auth via cookies Supabase
- Funções server-only para operações sensíveis
- Chaves de API seguras (não versionadas)

## 📊 Tabelas do Banco

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Usuários do sistema |
| `projetos` | Abrasel, Escalar, Escritorial, Outros Negócios |
| `analistas` | Quem toca as vagas (ligável a um usuário) |
| `clientes` | Empresas clientes |
| `vagas` | Uma linha da aba BD: cliente, cargo, receita, status, faturamento |
| `contatos` | Contatos CRM |
| `oportunidades` | Pipeline de vendas |
| `interacoes` | Histórico de contato |

## 🚀 Roadmap

- ✅ Setup inicial
- ✅ Infraestrutura em nuvem (Vercel + Supabase)
- ⏳ CRUD de vagas e empresas
- ⏳ Dashboard com cards
- ⏳ CRM: Pipeline de vendas
- ⏳ Faturamento consolidado
- ⏳ Integração com Indeed
- ⏳ Agendamento de entrevistas

