'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function publicarFeiraAction(feiraId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

  const { data: feira } = await supabase
    .from('feiras')
    .select('organizador_id, status')
    .eq('id', feiraId)
    .single()

  if (!feira || feira.organizador_id !== user.id) {
    return { error: 'Não autorizado' }
  }

  if (feira.status !== 'rascunho') {
    return { error: 'Esta feira já foi publicada' }
  }

  const { error } = await supabase
    .from('feiras')
    .update({ status: 'publicada' })
    .eq('id', feiraId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/organizador/feiras')
  revalidatePath('/dashboard/organizador')
  return { success: true }
}

export async function encerrarFeiraAction(feiraId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

  const { data: feira } = await supabase
    .from('feiras')
    .select('organizador_id, status')
    .eq('id', feiraId)
    .single()

  if (!feira || feira.organizador_id !== user.id) {
    return { error: 'Não autorizado' }
  }

  if (feira.status !== 'publicada') {
    return { error: 'Só é possível encerrar uma feira publicada' }
  }

  const { error } = await supabase
    .from('feiras')
    .update({ status: 'encerrada' })
    .eq('id', feiraId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/organizador/feiras')
  revalidatePath('/dashboard/organizador')
  revalidatePath(`/feiras/${feiraId}`)
  return { success: true }
}
