# CONECTA TAPERA

**Sua cidade conectada. Sua comunidade mais forte.**

Plataforma regional para aproximar moradores, comerciantes, empresas, prestadores de serviços e organizações sociais de São José da Tapera–AL e municípios vizinhos.

## O que já está no repositório
- Interface responsiva em React + Vite.
- Busca e filtros de estabelecimentos.
- Integração frontend com Supabase Auth: cadastro, login, sair e recuperação de senha.
- Consulta pública de estabelecimentos aprovados no Supabase.
- Migration PostgreSQL com perfis, papéis, municípios, empresas, serviços, vagas, publicações, favoritos e avaliações.
- Regras Row Level Security (RLS) e permissões mínimas por tabela.
- Guia de instalação e configuração em `supabase/README.md`.

## Configuração local
1. Instale Node.js (versão LTS).
2. Clone o repositório e entre na pasta.
3. Copie `.env.example` para `.env` e preencha a URL e a chave pública do seu projeto Supabase.
4. No painel Supabase, execute `supabase/migrations/202611250001_initial_schema.sql` no SQL Editor.
5. Instale e inicie:

```bash
npm install
npm run dev
```

## Segurança
- Nunca coloque a chave `service_role`, senha do banco ou credenciais privadas no frontend.
- Não remova as políticas RLS nem abra acesso público a tabelas privadas.
- Novos cadastros recebem o papel `resident`; a concessão de administrador é manual e controlada.
- Empresas aparecem publicamente somente após aprovação administrativa.

## Estado atual
A base visual, os fluxos de autenticação e a estrutura SQL estão no código. Para ativar o backend é necessário que o responsável pelo projeto crie/configure um projeto Supabase, execute a migration e preencha as variáveis locais. O painel administrativo completo, CRUD de todos os módulos, notificações e aplicativo Android ainda são etapas futuras.

Veja [o guia de configuração](supabase/README.md) e a [arquitetura](docs/architecture.md).
