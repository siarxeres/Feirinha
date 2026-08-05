-- Registro de GRANT aplicado manualmente em produção: a tabela public.comunicados
-- não tinha permissões concedidas para o role "authenticated", causando erro
-- "permission denied" ao enviar comunicados pelo app. Este arquivo documenta no
-- código o que já foi executado direto no banco de produção; não precisa ser
-- reaplicado (idempotente de qualquer forma, pois GRANT não falha se repetido).

grant select, insert, update, delete on public.comunicados to authenticated;
grant select, insert, update, delete on public.comunicados to service_role;
