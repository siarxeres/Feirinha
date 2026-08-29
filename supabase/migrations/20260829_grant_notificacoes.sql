-- Mesmo problema que a tabela public.comunicados teve (ver
-- 20260805_grant_comunicados.sql): a tabela public.notificacoes existe no
-- banco (schema completo, enum notificacao_tipo já criado) mas nunca recebeu
-- GRANT nenhum. Confirmado tentando ler a tabela até com a service_role key:
-- "permission denied for table notificacoes" — não é RLS bloqueando (isso
-- retornaria lista vazia), é falta de permissão mesmo, no nível do Postgres.
--
-- IMPORTANTE: diferente do arquivo de comunicados, este GRANT ainda NÃO foi
-- aplicado em produção. Precisa ser rodado manualmente no SQL Editor do
-- Supabase Studio — o agente que preparou esta migration só tem acesso
-- REST/DML ao projeto (via service role), sem canal para executar DDL
-- diretamente no Postgres.

grant select, insert, update, delete on public.notificacoes to authenticated;
grant select, insert, update, delete on public.notificacoes to service_role;
