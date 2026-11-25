# Arquitetura e roadmap — Conecta Tapera

## Perfis planejados
- Visitante: consulta conteúdo público.
- Morador: perfil, favoritos, avaliações e denúncias.
- Anunciante/profissional: gerencia o próprio negócio, serviços e vagas.
- Editor: publica notícias e eventos conforme permissão.
- Administrador: modera cadastros, usuários e conteúdo.

## Domínios de dados
users, profiles, roles, municipalities, businesses, business_hours, business_media, services, products, job_posts, news, events, public_services, reviews, favorites, reports, notifications e audit_logs.

## Regras de segurança
- Cada usuário só edita seus próprios recursos, salvo permissão administrativa.
- Cadastros comerciais passam por moderação antes do selo de verificação.
- Avaliações e denúncias precisam de controles contra abuso.
- Não publicar dados pessoais sensíveis.
- Implementar consentimento, política de privacidade, retenção e exclusão conforme LGPD.

## Roadmap
1. Fundação visual responsiva.
2. Backend, PostgreSQL e migrações.
3. Autenticação, recuperação de senha e controle de acesso.
4. CRUD real de empresas, serviços, produtos, vagas, notícias e eventos.
5. Painel administrativo e fila de moderação.
6. Busca geográfica, notificações, avaliações e relatórios.
7. Testes, acessibilidade, segurança, deploy e preparação do app Android.

## Limitação atual
A primeira versão usa dados demonstrativos locais. Ainda não possui login real, API, banco de dados, painel administrativo funcional nem app Android. Não inserir dados reais de cidadãos até implantar segurança e privacidade.
