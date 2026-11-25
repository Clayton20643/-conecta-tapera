# Configuração do Supabase — Conecta Tapera

O código de autenticação foi integrado ao frontend. Para ativá-lo, crie e configure um projeto Supabase na sua conta.

## 1. Criar o projeto
1. Acesse https://supabase.com/dashboard e entre na sua conta.
2. Crie um projeto chamado **Conecta Tapera**.
3. Guarde com segurança a senha do banco de dados. Ela não é necessária no frontend.

## 2. Criar as tabelas e regras de segurança
1. No painel do projeto, abra **SQL Editor**.
2. Abra o arquivo `supabase/migrations/202611250001_initial_schema.sql` deste repositório.
3. Copie todo o conteúdo, cole no SQL Editor e execute.
4. A migration cria tabelas para perfis, municípios, empresas, serviços, vagas, notícias/eventos, favoritos e avaliações, além de políticas RLS.

## 3. Configurar a autenticação
1. Em **Authentication → URL Configuration**, configure a URL local `http://localhost:5173`.
2. Ao publicar o site, adicione também o domínio oficial em **Site URL** e nas URLs de redirecionamento permitidas.
3. Em **Authentication → Providers → Email**, mantenha o provedor de e-mail habilitado.
4. Para produção, configure um provedor SMTP próprio para que as mensagens de confirmação e recuperação cheguem com confiabilidade.

## 4. Conectar o frontend
1. Abra **Project Settings → API** (ou a área de chaves de API).
2. Copie a **Project URL** e a chave pública **anon / publishable**.
3. Na pasta do projeto, copie `.env.example` para um arquivo chamado `.env`.
4. Preencha `VITE_SUPABASE_URL` com a Project URL e `VITE_SUPABASE_ANON_KEY` com a chave pública.
5. Execute:
   ```bash
   npm install
   npm run dev
   ```

O frontend não precisa da senha do banco nem da chave `service_role`. **Nunca** publique essas credenciais e não as coloque em variáveis `VITE_`.

## 5. Criar o primeiro administrador
Depois que sua própria conta tiver sido criada e confirmada no site:
1. No Supabase, abra **SQL Editor**.
2. Substitua o e-mail no comando abaixo pelo e-mail da sua conta e execute:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where email = 'SEU-EMAIL-AQUI'
on conflict (user_id, role) do nothing;
```

O papel `resident` é atribuído automaticamente a novas contas. Não conceda acesso administrativo a terceiros sem autorização.

## Recursos desta etapa
- Cadastro por e-mail e senha (mínimo de 8 caracteres no frontend).
- Login e encerramento de sessão.
- Recuperação de senha por e-mail.
- Criação automática de perfil e papel `resident`.
- Row Level Security (RLS) para limitar o acesso aos dados.
- Cadastro de empresa sujeito à aprovação administrativa.

## Importante
A autenticação só ficará ativa depois que as variáveis `.env` forem configuradas e a migration SQL for executada no seu projeto Supabase. Não há credenciais incluídas neste repositório.
