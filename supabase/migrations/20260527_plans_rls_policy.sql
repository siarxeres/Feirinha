-- Habilita leitura pública na tabela plans
-- Necessário para que usuários no onboarding possam ver os planos disponíveis
-- Execute no SQL Editor: https://supabase.com/dashboard/project/gmtfebfazptpmnnfiygh/sql/new

-- Habilita RLS (seguro mesmo que já esteja habilitado)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Policy de SELECT pública — planos são dados de catálogo, sem informação sensível
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'plans'
      AND policyname = 'plans_select_public'
  ) THEN
    CREATE POLICY plans_select_public ON public.plans
      FOR SELECT USING (true);
  END IF;
END $$;

-- Grant de SELECT para anon (onboarding antes do login) e authenticated
GRANT SELECT ON TABLE public.plans TO anon, authenticated;
