-- Talentos Database Schema
-- Execute this script in Supabase SQL Editor

-- 1. Profiles (User accounts - extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'recruiter',
  -- Roles: 'admin', 'recruiter', 'gerente', 'visualizador'
  empresa TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Empresas (Client companies)
CREATE TABLE IF NOT EXISTS public.empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  segmento TEXT,
  contato_principal TEXT,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  faturamento_total DECIMAL(12, 2) DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Vagas (Job openings)
CREATE TABLE IF NOT EXISTS public.vagas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  projeto TEXT NOT NULL,
  -- Projeto: "Abrasel", "Escalar Talentos", "Escritorial Talentos", etc
  status TEXT DEFAULT 'aberta',
  -- Status: 'aberta', 'candidatos', 'entrevista', 'fechada', 'cancelada'
  responsavel_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  salario DECIMAL(12, 2),
  data_abertura DATE,
  data_fechamento DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Contatos (CRM contacts)
CREATE TABLE IF NOT EXISTS public.contatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  cargo TEXT,
  principal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Interacoes (Interaction history - CRM)
CREATE TABLE IF NOT EXISTS public.interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contato_id UUID NOT NULL REFERENCES public.contatos(id) ON DELETE CASCADE,
  responsavel_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  -- Tipo: 'email', 'reuniao', 'ligacao', 'notas'
  descricao TEXT,
  data_interacao TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Oportunidades (Sales pipeline)
CREATE TABLE IF NOT EXISTS public.oportunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  responsavel_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor DECIMAL(12, 2),
  estago TEXT DEFAULT 'prospect',
  -- Estágio: 'prospect', 'qualificado', 'proposta', 'negociacao', 'fechado', 'perdido'
  data_prevista_fechamento DATE,
  data_fechamento DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Faturamento (Billing records)
CREATE TABLE IF NOT EXISTS public.faturamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vaga_id UUID REFERENCES public.vagas(id) ON DELETE SET NULL,
  oportunidade_id UUID REFERENCES public.oportunidades(id) ON DELETE SET NULL,
  responsavel_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  valor DECIMAL(12, 2) NOT NULL,
  status TEXT DEFAULT 'pendente',
  -- Status: 'pendente', 'recebido', 'atrasado'
  data_valor DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oportunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faturamento ENABLE ROW LEVEL SECURITY;

-- Profiles: Users see only their own profile
CREATE POLICY "Users see only own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admin can see all profiles" ON public.profiles
  FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Vagas: Users see only assigned vagas or all if admin
CREATE POLICY "Users see own vagas" ON public.vagas
  FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR responsavel_id = auth.uid()
    OR responsavel_id IS NULL
  );

CREATE POLICY "Users update own vagas" ON public.vagas
  FOR UPDATE USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR responsavel_id = auth.uid()
  );

-- Oportunidades: Users see only assigned opportunities or all if admin
CREATE POLICY "Users see own opportunities" ON public.oportunidades
  FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR responsavel_id = auth.uid()
  );

CREATE POLICY "Users update own opportunities" ON public.oportunidades
  FOR UPDATE USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR responsavel_id = auth.uid()
  );

-- Contatos: Anyone can see all contacts (needed for CRM)
CREATE POLICY "Authenticated users see all contacts" ON public.contatos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Interacoes: Users see only their own interactions or all if admin
CREATE POLICY "Users see own interactions" ON public.interacoes
  FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR responsavel_id = auth.uid()
  );

-- Faturamento: Users see only their own billing or all if admin
CREATE POLICY "Users see own billing" ON public.faturamento
  FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR responsavel_id = auth.uid()
  );

-- Empresas: Authenticated users can see all (may restrict later)
CREATE POLICY "Authenticated users see all companies" ON public.empresas
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- Indexes for performance
-- ============================================

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);

CREATE INDEX idx_vagas_empresa_id ON public.vagas(empresa_id);
CREATE INDEX idx_vagas_responsavel_id ON public.vagas(responsavel_id);
CREATE INDEX idx_vagas_status ON public.vagas(status);
CREATE INDEX idx_vagas_projeto ON public.vagas(projeto);

CREATE INDEX idx_contatos_empresa_id ON public.contatos(empresa_id);
CREATE INDEX idx_contatos_email ON public.contatos(email);

CREATE INDEX idx_interacoes_contato_id ON public.interacoes(contato_id);
CREATE INDEX idx_interacoes_responsavel_id ON public.interacoes(responsavel_id);

CREATE INDEX idx_oportunidades_empresa_id ON public.oportunidades(empresa_id);
CREATE INDEX idx_oportunidades_responsavel_id ON public.oportunidades(responsavel_id);
CREATE INDEX idx_oportunidades_estago ON public.oportunidades(estago);

CREATE INDEX idx_faturamento_empresa_id ON public.faturamento(empresa_id);
CREATE INDEX idx_faturamento_responsavel_id ON public.faturamento(responsavel_id);
CREATE INDEX idx_faturamento_status ON public.faturamento(status);

-- ============================================
-- Done!
-- ============================================
-- Next steps:
-- 1. Run this script in Supabase SQL Editor
-- 2. Create users via Authentication tab
-- 3. Insert profiles for each user
-- 4. Test login at localhost:3000
