'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { criarNotificacao } from '@/lib/notificacoes'

async function getInscricaoOwner(inscricaoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, supabase, feiranteOk: false, feiranteId: null, feiraId: null, feiraNome: null }

  const { data: inscricao } = await supabase
    .from('inscricoes')
    .select('feira_id, feirante_id, feiras(organizador_id, nome)')
    .eq('id', inscricaoId)
    .single()

  const feira = Array.isArray(inscricao?.feiras) ? inscricao.feiras[0] : inscricao?.feiras
  return {
    user,
    supabase,
    feiranteOk: feira?.organizador_id === user.id,
    feiranteId: inscricao?.feirante_id ?? null,
    feiraId: inscricao?.feira_id ?? null,
    feiraNome: feira?.nome ?? null,
  }
}

export async function rejeitarInscricao(inscricaoId: string) {
  const { supabase, feiranteOk, feiranteId, feiraId, feiraNome } = await getInscricaoOwner(inscricaoId)
  if (!feiranteOk) return { error: 'Não autorizado' }

  const { error } = await supabase
    .from('inscricoes')
    .update({ status: 'rejeitada' })
    .eq('id', inscricaoId)

  if (error) return { error: error.message }

  if (feiranteId) {
    await criarNotificacao(supabase, {
      userId: feiranteId,
      tipo: 'inscricao_rejeitada',
      titulo: 'Inscrição não aprovada',
      mensagem: feiraNome
        ? `Sua inscrição na feira "${feiraNome}" não foi aprovada dessa vez.`
        : 'Sua inscrição não foi aprovada dessa vez.',
      payload: { feira_id: feiraId, inscricao_id: inscricaoId },
    })
  }

  revalidatePath('/dashboard/organizador')
  revalidatePath('/dashboard/organizador/inscricoes')
  return { success: true }
}
