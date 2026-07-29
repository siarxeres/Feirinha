'use server'

import { createClient } from '@/lib/supabase/server'

export async function inscreverFeirante(
  feiraId: string,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

  const { data: existente } = await supabase
    .from('inscricoes')
    .select('id')
    .eq('feirante_id', user.id)
    .eq('feira_id', feiraId)
    .maybeSingle()

  if (existente) return { error: 'Você já está inscrito nessa feira.' }

  const { error } = await supabase
    .from('inscricoes')
    .insert({ feirante_id: user.id, feira_id: feiraId, status: 'pendente' })

  if (error) return { error: error.message }
  return { success: true }
}
