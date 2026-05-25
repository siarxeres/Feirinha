-- ============================================================
-- Onboarding e aprovação de feirante
-- Execute no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/gmtfebfazptpmnnfiygh/sql/new
-- ============================================================

-- 1. Campo de status de aprovação no perfil
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS aprovacao_status text DEFAULT NULL;

-- 2. Feirantes já com assinatura ativa ficam aprovados
UPDATE public.profiles
SET aprovacao_status = 'aprovado'
WHERE roles @> ARRAY['feirante']
  AND assinatura_status = 'ativa'
  AND aprovacao_status IS NULL;

-- 3. Demais feirantes ficam pendentes (precisam completar onboarding)
UPDATE public.profiles
SET aprovacao_status = 'pendente'
WHERE roles @> ARRAY['feirante']
  AND aprovacao_status IS NULL;

-- 4. Grants
GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated, service_role;
