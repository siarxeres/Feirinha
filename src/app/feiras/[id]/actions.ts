"use server"

import { createClient } from "@/lib/supabase/server"
import { criarNotificacao, criarNotificacoes } from "@/lib/notificacoes"

async function getFeiraOwnerByInscricaoId(inscricaoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, supabase, ok: false, feiranteId: null, feiraId: null, feiraNome: null }

  const { data: inscricao } = await supabase
    .from('inscricoes')
    .select('feira_id, feirante_id, feiras(organizador_id, nome)')
    .eq('id', inscricaoId)
    .single()

  const feira = Array.isArray(inscricao?.feiras) ? inscricao.feiras[0] : inscricao?.feiras
  return {
    user,
    supabase,
    ok: feira?.organizador_id === user.id,
    feiranteId: inscricao?.feirante_id ?? null,
    feiraId: inscricao?.feira_id ?? null,
    feiraNome: feira?.nome ?? null,
  }
}

export async function aprovarInscricaoAction({
  inscricaoId,
  barracaId = null,
}: {
  inscricaoId: string
  barracaId: string | null
}) {
  const { user, supabase, ok, feiranteId, feiraId, feiraNome } = await getFeiraOwnerByInscricaoId(inscricaoId)
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' }
  if (!ok) return { error: 'Não autorizado' }

  const { error } = await supabase.rpc("aprovar_inscricao", {
    p_inscricao_id: inscricaoId,
    p_barraca_id: barracaId,
  })

  if (error) {
    return { error: error.message }
  }

  if (feiranteId) {
    await criarNotificacao({
      userId: feiranteId,
      tipo: 'inscricao_aprovada',
      titulo: 'Inscrição aprovada!',
      mensagem: feiraNome
        ? `Sua inscrição na feira "${feiraNome}" foi aprovada.`
        : 'Sua inscrição foi aprovada.',
      payload: { feira_id: feiraId, inscricao_id: inscricaoId },
    })
  }

  return { success: true }
}

export async function rejeitarInscricaoAction({
  inscricaoId,
}: {
  inscricaoId: string
}) {
  const { user, supabase, ok, feiranteId, feiraId, feiraNome } = await getFeiraOwnerByInscricaoId(inscricaoId)
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' }
  if (!ok) return { error: 'Não autorizado' }

  const { error } = await supabase
    .from("inscricoes")
    .update({ status: "rejeitada" })
    .eq("id", inscricaoId)

  if (error) {
    return { error: error.message }
  }

  if (feiranteId) {
    await criarNotificacao({
      userId: feiranteId,
      tipo: 'inscricao_rejeitada',
      titulo: 'Inscrição não aprovada',
      mensagem: feiraNome
        ? `Sua inscrição na feira "${feiraNome}" não foi aprovada dessa vez.`
        : 'Sua inscrição não foi aprovada dessa vez.',
      payload: { feira_id: feiraId, inscricao_id: inscricaoId },
    })
  }

  return { success: true }
}

async function getFeiraOwnerByFeiraId(feiraId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, supabase, ok: false, feiraNome: null }

  const { data: feira } = await supabase
    .from('feiras')
    .select('organizador_id, nome')
    .eq('id', feiraId)
    .single()

  return { user, supabase, ok: feira?.organizador_id === user.id, feiraNome: feira?.nome ?? null }
}

async function getFeiraOwnerByDespesaId(despesaId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, supabase, ok: false }

  const { data: despesa } = await supabase
    .from('despesas_feira')
    .select('feira_id, feiras(organizador_id)')
    .eq('id', despesaId)
    .single()

  const feira = Array.isArray(despesa?.feiras) ? despesa.feiras[0] : despesa?.feiras
  return { user, supabase, ok: feira?.organizador_id === user.id }
}

export async function criarDespesaAction({
  feiraId,
  categoria,
  descricao,
  valor,
}: {
  feiraId: string
  categoria: string
  descricao: string | null
  valor: number
}) {
  const { user, supabase, ok } = await getFeiraOwnerByFeiraId(feiraId)
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' }
  if (!ok) return { error: 'Não autorizado' }

  const { error } = await supabase.from('despesas_feira').insert({
    feira_id: feiraId,
    categoria,
    descricao,
    valor,
    criado_por: user.id,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function editarDespesaAction({
  despesaId,
  categoria,
  descricao,
  valor,
}: {
  despesaId: string
  categoria: string
  descricao: string | null
  valor: number
}) {
  const { user, supabase, ok } = await getFeiraOwnerByDespesaId(despesaId)
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' }
  if (!ok) return { error: 'Não autorizado' }

  const { error } = await supabase
    .from('despesas_feira')
    .update({ categoria, descricao, valor })
    .eq('id', despesaId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function removerDespesaAction({ despesaId }: { despesaId: string }) {
  const { user, supabase, ok } = await getFeiraOwnerByDespesaId(despesaId)
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' }
  if (!ok) return { error: 'Não autorizado' }

  const { error } = await supabase.from('despesas_feira').delete().eq('id', despesaId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function enviarComunicadoAction({
  feiraId,
  destinatario,
  mensagem,
}: {
  feiraId: string
  destinatario: string
  mensagem: string
}) {
  const { user, supabase, ok, feiraNome } = await getFeiraOwnerByFeiraId(feiraId)
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' }
  if (!ok) return { error: 'Não autorizado' }

  const { error } = await supabase.from("comunicados").insert({
    feira_id: feiraId,
    organizador_id: user.id,
    destinatarios: destinatario,
    conteudo: mensagem,
    created_at: new Date().toISOString(),
  })

  if (error) {
    return { error: error.message }
  }

  const { data: inscritos } = await supabase
    .from('inscricoes')
    .select('feirante_id')
    .eq('feira_id', feiraId)

  const feiranteIds = Array.from(
    new Set((inscritos ?? []).map((i) => i.feirante_id).filter(Boolean))
  ) as string[]

  const mensagemCurta = mensagem.length > 140 ? `${mensagem.slice(0, 137)}...` : mensagem

  await criarNotificacoes(
    feiranteIds.map((feiranteId) => ({
      userId: feiranteId,
      tipo: 'comunicado' as const,
      titulo: feiraNome ? `Novo aviso — ${feiraNome}` : 'Novo aviso',
      mensagem: mensagemCurta,
      payload: { feira_id: feiraId },
    }))
  )

  return { success: true }
}
