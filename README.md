# CONECTA TAPERA

**Sua cidade conectada. Sua comunidade mais forte.**

Plataforma regional para aproximar moradores, comerciantes, empresas, prestadores de serviços e organizações sociais de São José da Tapera–AL e municípios vizinhos.

## Estado técnico
- Frontend React + Vite responsivo.
- Supabase Auth integrado: cadastro, login, sair, recuperação e alteração de senha.
- PostgreSQL configurado no projeto Supabase já existente.
- Migration inicial aplicada e confirmada.
- Nove tabelas públicas com Row Level Security (RLS) habilitado.
- Consulta da página inicial limitada a estabelecimentos com status aprovado.
- Chave pública Supabase preparada em `.env.example`.

## Executar no Windows
```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Abra no navegador o endereço local indicado pelo Vite (normalmente `http://localhost:5173`).

## Documentação
- [Configuração Supabase e execução local](supabase/README.md)
- [Arquitetura e roadmap](docs/architecture.md)
- [Migration SQL](supabase/migrations/202611250001_initial_schema.sql)

## Segurança
- A chave do frontend é do tipo publishable e foi criada para uso público no cliente.
- O arquivo local `.env` não deve ser enviado ao GitHub.
- Nunca publique senha do banco, chave `service_role` ou chave secreta.
- Novos usuários recebem papel `resident`; papéis administrativos são atribuídos separadamente.

## Próximas etapas
Formulários de gestão, painel administrativo, moderação completa, imagens, notificações, testes automatizados, hospedagem web e aplicativo Android.
