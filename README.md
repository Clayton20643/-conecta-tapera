# CONECTA TAPERA

**Sua cidade conectada. Sua comunidade mais forte.**

Plataforma regional para aproximar moradores, comerciantes, empresas, prestadores de serviços e organizações sociais de São José da Tapera–AL e municípios vizinhos.

## Estado técnico
- Frontend React + Vite responsivo.
- Supabase Auth integrado no código: cadastro, login, sair, recuperação e alteração de senha.
- PostgreSQL configurado no projeto Supabase existente.
- Duas migrations aplicadas e confirmadas.
- Nove tabelas públicas com Row Level Security (RLS) habilitado.
- Consulta de estabelecimentos aprovados na página inicial.
- Painel administrativo com moderação de estabelecimentos, publicações e consulta de perfis/papéis (acesso restrito a administradores e editores).
- Chave pública Supabase preparada em `.env.example`.
- GitHub Actions: compilação do frontend concluída com sucesso.

## Executar no Windows
```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Abra no navegador o endereço local indicado pelo Vite (normalmente `http://localhost:5173`).

## Documentação
- [Configuração do Supabase e execução local](supabase/README.md)
- [Arquitetura e roadmap](docs/architecture.md)
- [Migration SQL](supabase/migrations/202611250001_initial_schema.sql)

## Segurança
- A chave do frontend é do tipo publishable e foi criada para uso público no cliente.
- O arquivo local `.env` não deve ser enviado ao GitHub.
- Nunca publique senha do banco, chave `service_role` ou chave secreta.
- Novos usuários recebem papel `resident`; papéis administrativos são atribuídos separadamente.
- As permissões são aplicadas no banco via RLS, não apenas por esconder botões na interface.

## Pendências antes de usar com o público
- Adicionar `http://localhost:5173` em Authentication → URL Configuration → Redirect URLs no Supabase.
- Criar e confirmar a conta do responsável e conceder a ela o papel `admin`.
- Testar cadastro, login, recuperação de senha e moderação com uma conta autorizada.
- Implementar formulário de cadastro/edição de empresas, serviços e vagas.
- Completar gestão de usuários, upload de imagens, notificações, testes de segurança, hospedagem web e aplicativo Android.
