# Supabase configurado — Conecta Tapera

O projeto Supabase existente já foi conectado e a estrutura inicial do banco foi aplicada pelo ChatGPT em **25 de novembro de 2026**.

## Estado atual
- Projeto Supabase: ativo, região São Paulo (sa-east-1).
- Banco PostgreSQL: migration inicial e migration de reforço de segurança/índices aplicadas.
- Tabelas: municípios, perfis, papéis, empresas, serviços, vagas, publicações, favoritos e avaliações.
- Segurança: RLS ativado nas nove tabelas públicas; o verificador de segurança não apresenta alertas.
- O município São José da Tapera–AL já está cadastrado.
- Cadastro, login, encerramento de sessão e recuperação de senha estão integrados ao frontend.
- A listagem pública do site consulta empresas aprovadas no banco de dados.

## Executar o site no computador
1. Baixe/clonar o repositório: https://github.com/Clayton20643/-conecta-tapera
2. Instale Node.js LTS caso ainda não esteja instalado.
3. Abra a pasta do projeto no terminal.
4. Copie `.env.example` para um arquivo local chamado `.env`. O arquivo de exemplo já contém a URL e a chave pública corretas.
5. Execute:
   ```bash
   npm install
   npm run dev
   ```
6. Abra no navegador o endereço local exibido pelo Vite (normalmente `http://localhost:5173`).

O GitHub Actions já executou a etapa de compilação do frontend com sucesso.

No Windows PowerShell, a cópia pode ser feita com:
```powershell
Copy-Item .env.example .env
```

## Configuração de e-mail e URLs
No painel do Supabase:
1. Acesse Authentication → URL Configuration.
2. Adicione `http://localhost:5173` à lista de URLs de redirecionamento permitidas.
3. Confira se o provedor Email está habilitado.
4. Antes de publicar o site, adicione o domínio de produção à lista de URLs permitidas.
5. Para uso em produção, configure SMTP próprio para confirmação e recuperação de e-mail.

O projeto ainda não tem domínio público configurado.

## Primeiro administrador
Novas contas recebem apenas o papel `resident`. Após criar e confirmar sua própria conta, o responsável do projeto pode atribuir o papel `admin` de forma controlada no SQL Editor. Não conceda privilégios administrativos a outras contas.

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where email = 'SEU-EMAIL-AQUI'
on conflict (user_id, role) do nothing;
```

## Segurança das chaves
- O arquivo `.env.example` contém somente a URL e a chave pública `sb_publishable_`, que foi criada para uso em aplicações cliente.
- O arquivo local `.env` está listado no `.gitignore`.
- Nunca coloque senha de banco, chave `service_role` ou chave `sb_secret_` no navegador ou no GitHub.

## O que ainda não foi implementado
- Formulários para cadastrar e editar empresas, produtos, serviços, vagas e notícias.
- Painel administrativo completo.
- Notificações.
- Upload de imagens.
- Publicação do site em um domínio.
- Aplicativo Android.
