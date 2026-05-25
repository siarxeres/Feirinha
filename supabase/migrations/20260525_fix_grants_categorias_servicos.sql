-- Garante que as tabelas categorias e servicos têm os grants padrão do Supabase
-- para que o service_role e authenticated possam operar via PostgREST

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.categorias  TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.servicos     TO anon, authenticated, service_role;

-- Habilita o acesso a sequences (necessário para INSERT com SERIAL/UUID)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
