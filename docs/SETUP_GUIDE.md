# 🚀 Guia de Setup - Talentos

Siga este guia para configurar completamente o projeto Talentos do zero.

## Passo 1: Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique **New Project**
3. Escolha um nome (ex: "talentos-prod")
4. Escolha região (ex: "São Paulo - sa-east-1")
5. Defina uma senha segura
6. Clique **Create new project** e aguarde

## Passo 2: Copiar Credenciais Supabase

Após o projeto ser criado:

1. Vá para **Settings** → **API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon key** → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Service role secret** → `SUPABASE_SECRET_KEY`

## Passo 3: Configurar `.env.local`

Na raiz do projeto, abra `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **NÃO COMMITAR** este arquivo!

## Passo 4: Criar Tabelas no Banco

1. No Supabase, vá para **SQL Editor**
2. Clique **New Query**
3. Cole todo o conteúdo de `docs/DATABASE_SCHEMA.sql`
4. Clique **Run** e aguarde

Você verá mensagens de sucesso para cada tabela criada.

## Passo 5: Criar Primeiro Usuário

1. No Supabase, vá para **Authentication** → **Users**
2. Clique **Add user** (canto superior direito)
3. Preencha:
   - Email: seu.email@example.com
   - Password: senhaSegura123!
4. Clique **Save**

## Passo 6: Criar Perfil do Usuário

Agora precisamos criar o perfil correspondente na tabela `profiles`:

1. No Supabase, vá para **SQL Editor**
2. Clique **New Query**
3. Cole este código, substituindo os valores:

```sql
INSERT INTO public.profiles (id, email, name, role, empresa, ativo)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Substitua pelo ID do usuário criado
  'seu.email@example.com',
  'Seu Nome',
  'admin',
  'Escalar Talentos',
  true
);
```

### Como encontrar o ID do usuário?

1. Vá para **Authentication** → **Users**
2. Clique sobre o usuário criado
3. Copie o **UID** (ID)

4. Clique **Run** na query

## Passo 7: Testar Localmente

```bash
# Terminal na raiz do projeto
npm install  # se ainda não fez
npm run dev
```

Acesse `http://localhost:3000`:

✅ Você será redirecionado para `/login`  
✅ Faça login com seu email e senha  
✅ Verá o dashboard em `/painel`  
✅ Clique "Sair" para fazer logout  

Se houver erros:
- Verifique se `.env.local` tem as credenciais corretas
- Verifique se as tabelas foram criadas (Supabase → Table Editor)
- Verifique se o perfil foi criado (Supabase → Table Editor → profiles)

## Passo 8: Fazer Build

```bash
npm run build
```

Se passar sem erros, está tudo configurado! ✅

## Passo 9: Deploy no Vercel (Opcional por enquanto)

```bash
git add .
git commit -m "Initial setup"
git push origin main
```

Depois conecte no Vercel:

1. Acesse [vercel.com](https://vercel.com)
2. Clique **New Project**
3. Conecte seu repositório GitHub
4. Clique **Import**
5. Adicione as variáveis de ambiente (mesmo `.env.local`)
6. Clique **Deploy**

## 🎉 Pronto!

Você agora tem:
- ✅ Repositório Next.js configurado
- ✅ Banco Supabase com todas as tabelas
- ✅ Autenticação funcionando
- ✅ Dashboard protegido

## 📝 Próximos Passos

- [ ] Cadastrar primeiro usuário (você)
- [ ] Criar algumas empresas de teste
- [ ] Criar vagas de teste
- [ ] Testar pipeline de vendas
- [ ] Começar CRUD de vagas
- [ ] Criar dashboard com cards

## ❓ Troubleshooting

### Erro: "SUPABASE_SECRET_KEY is not set"
→ Verifique se `.env.local` existe e tem o `SUPABASE_SECRET_KEY` preenchido

### Erro: "Invalid credentials"
→ Verifique se o email e senha estão corretos na tabela `auth.users`

### Erro: "profile not found"
→ Você criou o usuário no Auth, mas não criou o perfil? Execute o SQL do Passo 6

### "localhost não conecta"
→ Verifique se rodou `npm run dev` e se não há outras apps na porta 3000

## 📞 Suporte

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
