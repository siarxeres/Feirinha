-- ============================================================
-- Assinatura de feirante via Asaas
-- Execute no SQL Editor:
-- https://supabase.com/dashboard/project/gmtfebfazptpmnnfiygh/sql/new
-- ============================================================

-- 1. Novos campos no profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS assinatura_status  text        NOT NULL DEFAULT 'inativa',
  ADD COLUMN IF NOT EXISTS assinatura_expira_em timestamptz,
  ADD COLUMN IF NOT EXISTS asaas_customer_id  text,
  ADD COLUMN IF NOT EXISTS cpf_cnpj           text;

-- 2. Tabela assinaturas
CREATE TABLE IF NOT EXISTS public.assinaturas (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  feirante_id       uuid        REFERENCES public.profiles(id) ON DELETE CASCADE,
  asaas_payment_id  text        NOT NULL,
  asaas_customer_id text,
  valor             numeric(10,2) NOT NULL DEFAULT 29.90,
  status            text        NOT NULL DEFAULT 'aguardando', -- aguardando | pago | expirado | estornado
  tipo              text        NOT NULL DEFAULT 'PIX',        -- PIX | BOLETO
  pix_payload       text,
  pix_qr_code       text,
  boleto_url        text,
  vencimento        date,
  created_at        timestamptz DEFAULT now()
);

-- 3. Colunas opcionais caso a tabela já existisse com estrutura diferente
ALTER TABLE public.assinaturas ADD COLUMN IF NOT EXISTS pix_payload  text;
ALTER TABLE public.assinaturas ADD COLUMN IF NOT EXISTS pix_qr_code  text;
ALTER TABLE public.assinaturas ADD COLUMN IF NOT EXISTS boleto_url   text;
ALTER TABLE public.assinaturas ADD COLUMN IF NOT EXISTS vencimento   date;

-- 4. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.assinaturas TO anon, authenticated, service_role;
GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated, service_role;
