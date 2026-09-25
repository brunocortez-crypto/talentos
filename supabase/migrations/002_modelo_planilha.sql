-- Troca o modelo genérico pelo modelo da planilha BD_Talentos.
-- As tabelas removidas abaixo estavam vazias quando esta migração foi aplicada.

begin;

drop table if exists
  public.faturamento,
  public.interacoes,
  public.oportunidades,
  public.contatos,
  public.vagas,
  public.empresas
cascade;

-- Papéis ------------------------------------------------------------------

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'gerente', 'recruiter', 'visualizador'));

-- security definer: as policies consultam profiles sem cair na própria RLS de profiles
create or replace function public.papel_atual() returns text
language sql stable security definer set search_path = ''
as $$ select role from public.profiles where id = auth.uid() and ativo $$;

create or replace function public.ve_tudo() returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce(public.papel_atual() in ('admin', 'gerente', 'visualizador'), false) $$;

create or replace function public.edita_tudo() returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce(public.papel_atual() in ('admin', 'gerente'), false) $$;

create or replace function public.tocar_atualizado_em() returns trigger
language plpgsql set search_path = ''
as $$ begin new.atualizado_em = now(); return new; end $$;

-- Cadastros ---------------------------------------------------------------

create table public.projetos (
  id smallint generated always as identity primary key,
  nome text not null unique,
  ativo boolean not null default true
);

insert into public.projetos (nome)
values ('Abrasel'), ('Escalar'), ('Escritorial'), ('Outros Negócios');

create table public.analistas (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  profile_id uuid unique references public.profiles(id) on delete set null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create or replace function public.minha_analista() returns uuid
language sql stable security definer set search_path = ''
as $$ select id from public.analistas where profile_id = auth.uid() $$;

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  cnpj text unique,
  segmento text,
  cidade text,
  email text,
  telefone text,
  observacoes text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create trigger clientes_atualizado_em before update on public.clientes
  for each row execute function public.tocar_atualizado_em();

-- Vagas (uma linha da aba BD = uma vaga) ----------------------------------

create table public.vagas (
  id uuid primary key default gen_random_uuid(),
  projeto_id smallint not null references public.projetos(id),
  empresa_faturamento text
    check (empresa_faturamento in ('Escritorial Talentos', 'Escalar Talentos')),
  canal text,
  cliente_id uuid not null references public.clientes(id) on delete restrict,
  cidade text,
  cargo text not null,
  quantidade integer not null default 1 check (quantidade > 0),
  receita numeric(12, 2) not null default 0,
  analista_id uuid references public.analistas(id) on delete set null,
  status text not null default 'aberta'
    check (status in ('aberta', 'faturar', 'concluida', 'substituicao', 'congelada', 'cancelada')),
  tipo_faturamento text
    check (tipo_faturamento in ('normal', 'substituicao', 'reposicao', 'bonificacao', 'cancelada')),
  observacoes text,
  data_abertura date not null default current_date,
  data_conclusao date,
  planilha_linha integer unique,
  planilha_original jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index vagas_cliente_idx on public.vagas (cliente_id);
create index vagas_analista_idx on public.vagas (analista_id);
create index vagas_status_idx on public.vagas (status);
create index vagas_abertura_idx on public.vagas (data_abertura);

create trigger vagas_atualizado_em before update on public.vagas
  for each row execute function public.tocar_atualizado_em();

-- CRM ---------------------------------------------------------------------

create table public.contatos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  nome text not null,
  cargo text,
  email text,
  telefone text,
  principal boolean not null default false,
  criado_em timestamptz not null default now()
);

create index contatos_cliente_idx on public.contatos (cliente_id);

create table public.oportunidades (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  responsavel_id uuid references public.profiles(id) on delete set null,
  titulo text not null,
  valor numeric(12, 2),
  etapa text not null default 'prospect'
    check (etapa in ('prospect', 'qualificado', 'proposta', 'negociacao', 'ganha', 'perdida')),
  previsao_fechamento date,
  observacoes text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index oportunidades_cliente_idx on public.oportunidades (cliente_id);

create trigger oportunidades_atualizado_em before update on public.oportunidades
  for each row execute function public.tocar_atualizado_em();

create table public.interacoes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  contato_id uuid references public.contatos(id) on delete set null,
  oportunidade_id uuid references public.oportunidades(id) on delete set null,
  autor_id uuid not null default auth.uid() references public.profiles(id),
  tipo text not null check (tipo in ('email', 'reuniao', 'ligacao', 'whatsapp', 'nota')),
  descricao text,
  ocorreu_em timestamptz not null default now()
);

create index interacoes_cliente_idx on public.interacoes (cliente_id);

-- Acesso ------------------------------------------------------------------

grant select, insert, update, delete on all tables in schema public to authenticated;

alter table public.projetos enable row level security;
alter table public.analistas enable row level security;
alter table public.clientes enable row level security;
alter table public.vagas enable row level security;
alter table public.contatos enable row level security;
alter table public.oportunidades enable row level security;
alter table public.interacoes enable row level security;

drop policy if exists "Users see only own profile" on public.profiles;
drop policy if exists "Admin can see all profiles" on public.profiles;
create policy profiles_ler on public.profiles for select to authenticated
  using (id = auth.uid() or public.ve_tudo());
create policy profiles_admin on public.profiles for update to authenticated
  using (public.papel_atual() = 'admin') with check (public.papel_atual() = 'admin');

create policy projetos_ler on public.projetos for select to authenticated using (true);
create policy projetos_admin on public.projetos for all to authenticated
  using (public.edita_tudo()) with check (public.edita_tudo());

create policy analistas_ler on public.analistas for select to authenticated using (true);
create policy analistas_admin on public.analistas for all to authenticated
  using (public.edita_tudo()) with check (public.edita_tudo());

create policy clientes_ler on public.clientes for select to authenticated using (true);
create policy clientes_criar on public.clientes for insert to authenticated with check (true);
create policy clientes_editar on public.clientes for update to authenticated using (true) with check (true);
create policy clientes_apagar on public.clientes for delete to authenticated using (public.edita_tudo());

create policy vagas_ler on public.vagas for select to authenticated
  using (public.ve_tudo() or analista_id = public.minha_analista());
create policy vagas_criar on public.vagas for insert to authenticated
  with check (public.edita_tudo() or analista_id = public.minha_analista());
create policy vagas_editar on public.vagas for update to authenticated
  using (public.edita_tudo() or analista_id = public.minha_analista())
  with check (public.edita_tudo() or analista_id = public.minha_analista());
create policy vagas_apagar on public.vagas for delete to authenticated using (public.edita_tudo());

create policy contatos_ler on public.contatos for select to authenticated using (true);
create policy contatos_criar on public.contatos for insert to authenticated with check (true);
create policy contatos_editar on public.contatos for update to authenticated using (true) with check (true);
create policy contatos_apagar on public.contatos for delete to authenticated using (public.edita_tudo());

create policy oportunidades_ler on public.oportunidades for select to authenticated
  using (public.ve_tudo() or responsavel_id = auth.uid());
create policy oportunidades_criar on public.oportunidades for insert to authenticated
  with check (public.edita_tudo() or responsavel_id = auth.uid());
create policy oportunidades_editar on public.oportunidades for update to authenticated
  using (public.edita_tudo() or responsavel_id = auth.uid())
  with check (public.edita_tudo() or responsavel_id = auth.uid());
create policy oportunidades_apagar on public.oportunidades for delete to authenticated
  using (public.edita_tudo());

create policy interacoes_ler on public.interacoes for select to authenticated
  using (public.ve_tudo() or autor_id = auth.uid());
create policy interacoes_criar on public.interacoes for insert to authenticated
  with check (autor_id = auth.uid());
create policy interacoes_apagar on public.interacoes for delete to authenticated
  using (public.edita_tudo());

commit;
