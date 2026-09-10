-- RLS para despesas_feira — fecha o alerta de seguranca do Supabase de 09/09/2026
-- (tabela estava com RLS desligado e GRANT liberado pra anon: leitura/escrita publica)
-- Execute no SQL Editor: https://supabase.com/dashboard/project/gmtfebfazptpmnnfiygh/sql/new

ALTER TABLE public.despesas_feira ENABLE ROW LEVEL SECURITY;

-- SELECT: qualquer usuario autenticado pode ler. Replica o comportamento atual da
-- tela /feiras/[id]/inscricao, que mostra o rateio de despesas como preview de
-- transparencia mesmo para quem ainda nao se inscreveu na feira.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'despesas_feira'
      AND policyname = 'despesas_feira_select_authenticated'
  ) THEN
    CREATE POLICY "despesas_feira_select_authenticated"
      ON public.despesas_feira
      FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;

-- INSERT: só o organizador dono da feira (replica a checagem de
-- getFeiraOwnerByFeiraId em src/app/feiras/[id]/actions.ts)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'despesas_feira'
      AND policyname = 'despesas_feira_insert_organizador'
  ) THEN
    CREATE POLICY "despesas_feira_insert_organizador"
      ON public.despesas_feira
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.feiras f
          WHERE f.id = despesas_feira.feira_id
            AND f.organizador_id = auth.uid()
        )
      );
  END IF;
END $$;

-- UPDATE: só o organizador dono da feira (replica getFeiraOwnerByDespesaId)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'despesas_feira'
      AND policyname = 'despesas_feira_update_organizador'
  ) THEN
    CREATE POLICY "despesas_feira_update_organizador"
      ON public.despesas_feira
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.feiras f
          WHERE f.id = despesas_feira.feira_id
            AND f.organizador_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.feiras f
          WHERE f.id = despesas_feira.feira_id
            AND f.organizador_id = auth.uid()
        )
      );
  END IF;
END $$;

-- DELETE: só o organizador dono da feira (replica getFeiraOwnerByDespesaId)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'despesas_feira'
      AND policyname = 'despesas_feira_delete_organizador'
  ) THEN
    CREATE POLICY "despesas_feira_delete_organizador"
      ON public.despesas_feira
      FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.feiras f
          WHERE f.id = despesas_feira.feira_id
            AND f.organizador_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Fecha o acesso anonimo (causa raiz do alerta) e mantem authenticated/service_role
REVOKE ALL ON public.despesas_feira FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.despesas_feira TO authenticated, service_role;
