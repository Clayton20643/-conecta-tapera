# Arquitetura — Conecta Tapera

## Visão geral
- Frontend: React + Vite, com layout responsivo.
- Autenticação: Supabase Auth (e-mail e senha).
- Dados: PostgreSQL gerenciado pelo Supabase.
- Autorização: Row Level Security (RLS) no banco.
- Configuração de frontend: variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

## Papéis
- `resident`: papel automático de toda conta recém-criada.
- `editor`: pode administrar notícias, eventos e comunicados.
- `admin`: administra cadastros, perfis, municípios, vagas e moderação.

Os papéis ficam em `public.user_roles`, separados dos metadados editáveis pelo próprio usuário. Atribuições administrativas devem ser feitas por operador autorizado no SQL Editor.

## Tabelas iniciais
- `municipalities`: municípios e estado.
- `profiles`: nome público e município associado ao perfil.
- `user_roles`: permissões controladas.
- `businesses`: empresas e profissionais, com aprovação.
- `business_services`: serviços oferecidos por empresas.
- `job_posts`: oportunidades de trabalho.
- `community_posts`: notícias, eventos e comunicados.
- `favorites`: estabelecimentos favoritos.
- `reviews`: avaliações com moderação.

## Regras fundamentais
- Visitantes consultam somente estabelecimentos aprovados, serviços ativos de estabelecimentos aprovados, publicações publicadas e avaliações visíveis.
- Proprietários administram somente os próprios cadastros e não conseguem aprovar a própria empresa ou vaga.
- Editores e administradores podem publicar conteúdo comunitário.
- Administradores fazem a moderação e controlam papéis.
- Perfis só podem editar nome e município; não podem atribuir papéis a si mesmos.
- Cada tabela exposta tem RLS habilitado e permissões SQL restritas.

## Roadmap
1. Fundação visual e autenticação — implementadas no código.
2. Esquema inicial PostgreSQL/RLS — migration preparada; precisa ser executada no projeto Supabase.
3. Formulários CRUD para empresas, serviços, vagas, notícias e eventos.
4. Painel administrativo com fila de aprovação.
5. Favoritos e avaliações conectados ao banco.
6. Busca geográfica, notificações, testes de segurança e acessibilidade.
7. Deploy web e preparação do aplicativo Android.

## Limites da versão
A autenticação e consultas Supabase só funcionam depois de configurar o projeto e as variáveis de ambiente. Os cadastros, serviços, vagas e publicações ainda não têm telas completas de gerenciamento. O painel de administração e o app Android não foram implementados.
