# Supabase configurado — Conecta Tapera

O projeto Supabase existente foi conectado e a estrutura inicial do banco foi aplicada em **25 de novembro de 2026**.

## Estado atual
- Projeto Supabase: ativo, região São Paulo (sa-east-1).
- Banco PostgreSQL: duas migrations aplicadas.
- Tabelas: municípios, perfis, papéis, empresas, serviços, vagas, publicações, favoritos e avaliações.
- Segurança: RLS ativado nas nove tabelas públicas; o verificador de segurança não apresenta alertas.
- O município São José da Tapera–AL já está cadastrado.
- Cadastro, login, encerramento de sessão e recuperação de senha estão integrados ao frontend.
- A página inicial consulta empresas aprovadas no banco.
- O painel administrativo já oferece moderação de empresas, publicação de conteúdo e consulta de perfis/papéis. Só aparece para contas com papel `admin` ou `editor`.

## 1. Liberar o endereço local de autenticação
Este é o único ajuste de configuração do Dashboard que ainda precisa ser feito manualmente:
1. Abra [Authentication → URL Configuration](https://supabase.com/dashboard/project/djnqozbcmtbtomeenxwo/auth/url-configuration).
2. Em **Redirect URLs**, adicione exatamente `http://localhost:5173`.
3. Para desenvolvimento local, defina também **Site URL** como `http://localhost:5173`.
4. Salve as alterações.

Quando o site tiver domínio de produção, será necessário adicionar o domínio HTTPS à lista e ajustar o Site URL.

## 2. Executar o site no computador
1. Baixe/clonar o repositório: https://github.com/Clayton20643/-conecta-tapera
2. Instale Node.js LTS caso ainda não esteja instalado.
3. Abra a pasta do projeto no terminal.
4. Copie `.env.example` para um arquivo local chamado `.env`. O arquivo de exemplo já contém a URL e a chave pública corretas.
5. No PowerShell:
   ```powershell
   Copy-Item .env.example .env
   npm install
   npm run dev
   ```
6. Abra o endereço local indicado pelo Vite (normalmente `http://localhost:5173`).

O GitHub Actions já executou a compilação do frontend com sucesso.

## 3. Criar a conta do responsável
1. Abra o site local e clique em **Criar conta**.
2. Cadastre seu nome, e-mail e senha.
3. Confirme o endereço pelo e-mail recebido.
4. Entre na plataforma.

**A conta do responsável ainda não foi criada.** O banco está sem usuários, por isso ainda não há administrador atribuído. Depois de criar e confirmar a sua conta, o administrador do projeto poderá conceder o papel `admin` a esse cadastro no SQL Editor. O acesso administrativo não é atribuído automaticamente para impedir que o primeiro visitante se torne administrador.

Comando de atribuição manual — trocar o e-mail pelo e-mail da conta que você acabou de confirmar:

```sql
insert into public.user_roles (user_id, role, assigned_by)
select id, 'admin'::public.app_role, id
from auth.users
where lower(email) = lower('SEU-EMAIL-AQUI')
on conflict (user_id, role) do nothing;
```

Após a atribuição, saia e entre novamente no site. O botão **Painel** aparecerá no cabeçalho.

## 4. Segurança das chaves
- `.env.example` contém somente a URL e a chave pública `sb_publishable_`.
- O arquivo local `.env` está listado no `.gitignore`.
- Nunca coloque senha do banco, chave `service_role` ou chave `sb_secret_` no navegador ou no GitHub.

## Recursos administrativos disponíveis
- Visão geral com indicadores básicos.
- Aprovar ou recusar estabelecimentos pendentes.
- Criar notícias, eventos e comunicados como rascunho ou publicação.
- Publicar, arquivar como rascunho e excluir conteúdo.
- Consultar perfis e papéis de contas (apenas administrador).

## O que ainda falta
- Formulários para moradores enviarem empresas, serviços e vagas.
- Edição completa de todos os dados comerciais e vagas.
- Gestão de permissões pelo próprio painel (atribuição de papéis continua controlada pelo proprietário).
- Upload de imagens.
- Notificações.
- Publicação do site em um domínio.
- Aplicativo Android.

O site não está publicado na internet; a execução local e os testes reais de autenticação dependem de Node.js no computador e da confirmação de e-mail.
