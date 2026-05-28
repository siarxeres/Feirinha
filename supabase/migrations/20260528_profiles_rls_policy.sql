-- RLS para tabela profiles: authenticated users leem e atualizam apenas seu próprio perfil
-- Execute no SQL Editor: https://supabase.com/dashboard/project/gmtfebfazptpmnnfiygh/sql/new

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: cada usuário lê somente o próprio perfil
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_select_own'
  ) THEN
    CREATE POLICY "profiles_select_own" ON public.profiles
      FOR SELECT TO authenticated
      USING (id = auth.uid());
  END IF;
END $$;

-- UPDATE: cada usuário atualiza somente o próprio perfil
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_update_own'
  ) THEN
    CREATE POLICY "profiles_update_own" ON public.profiles
      FOR UPDATE TO authenticated
      USING (id = auth.uid());
  END IF;
END $$;

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
