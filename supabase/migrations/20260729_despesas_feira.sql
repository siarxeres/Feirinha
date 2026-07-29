-- Tabela de despesas da feira, usada para rateio (transparência) entre feirantes inscritos.
-- Fase 1: apenas cadastro/consulta. Nenhum valor é cobrado ou movimentado pelo app.

CREATE TABLE public.despesas_feira (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feira_id uuid NOT NULL REFERENCES public.feiras(id) ON DELETE CASCADE,
  categoria text NOT NULL CHECK (categoria IN ('energia', 'mesas_cadeiras', 'limpeza', 'som', 'outros')),
  descricao text,
  valor numeric(10,2) NOT NULL CHECK (valor > 0),
  criado_por uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX despesas_feira_feira_id_idx ON public.despesas_feira(feira_id);

-- TODO: RLS junto com inscricoes quando o staging existir.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.despesas_feira TO anon, authenticated, service_role;
