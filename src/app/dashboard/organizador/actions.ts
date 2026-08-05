'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getInscricaoOwner(inscricaoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, supabase, feiranteOk: false }

  const { data: inscricao } = await supabase
    .from('inscricoes')
    .select('feira_id, feiras(organizador_id)')
    .eq('id', inscricaoId)
    .single()

  const feira = Array.isArray(inscricao?.feiras) ? inscricao.feiras[0] : inscricao?.feiras
  return { user, supabase, feiranteOk: feira?.organizador_id === user.id }
}

export async function rejeitarInscricao(inscricaoId: string) {
  const { supabase, feiranteOk } = await getInscricaoOwner(inscricaoId)
  if (!feiranteOk) return { error: 'Não autorizado' }

  const { error } = await supabase
    .from('inscricoes')
    .update({ status: 'rejeitada' })
    .eq('id', inscricaoId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/organizador')
  revalidatePath('/dashboard/organizador/inscricoes')
  return { success: true }
}
