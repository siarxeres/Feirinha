"use server"

import { createClient } from "@/lib/supabase/server"

export async function aprovarInscricaoAction({
  inscricaoId,
  barracaId = null,
}: {
  inscricaoId: string
  barracaId: string | null
}) {
  const supabase = await createClient()
  const { error } = await supabase.rpc("aprovar_inscricao", {
    p_inscricao_id: inscricaoId,
    p_barraca_id: barracaId,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function rejeitarInscricaoAction({
  inscricaoId,
}: {
  inscricaoId: string
}) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("inscricoes")
    .update({ status: "rejeitada" })
    .eq("id", inscricaoId)

  if (error) {
    return { error: error.message }
  }

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
  const supabase = await createClient()
  const { error } = await supabase.from("comunicados").insert({
    feira_id: feiraId,
    destinatario,
    mensagem,
    created_at: new Date().toISOString(),
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
