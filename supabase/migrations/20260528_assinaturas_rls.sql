-- RLS para tabela assinaturas
-- Execute no SQL Editor: https://supabase.com/dashboard/project/gmtfebfazptpmnnfiygh/sql/new

ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assinaturas_insert_own" ON public.assinaturas
  FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "assinaturas_select_own" ON public.assinaturas
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

GRANT INSERT, SELECT ON public.assinaturas TO authenticated;
