"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { isFeiraEncerradaPorData } from "@/lib/feira-status"

export type NovaFeiraPayload = {
  nome: string
  descricao: string
  categorias: string[] | string
  dataInicio: string
  dataFim: string
  horaAbertura: string
  horaFechamento: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  linhas: number
  colunas: number
  taxaInscricao: number
  taxaBarraca: number
  prazoPagamento: number
  capacidadeBarracas?: number
}

function normalizePayload(payload: FormData | Record<string, any>): Record<string, any> {
  const values: Record<string, any> = {}

  if (payload instanceof FormData) {
    for (const [key, value] of payload.entries()) {
      values[key] = value
    }
  } else {
    Object.assign(values, payload)
  }

  if (typeof values.categorias === "string") {
    try {
      values.categorias = JSON.parse(values.categorias)
    } catch {
      values.categorias = [values.categorias]
    }
  }

  if (!Array.isArray(values.categorias)) {
    values.categorias = []
  }

  values.dataInicio = values.dataInicio ?? values.data_inicio
  values.dataFim = values.dataFim ?? values.data_fim
  values.horaAbertura = values.horaAbertura ?? values.hora_abertura
  values.horaFechamento = values.horaFechamento ?? values.hora_fechamento
  values.descricao = values.descricao ?? ""
  values.cep = values.cep ?? ""
  values.taxaInscricao = Number(values.taxaInscricao ?? values.taxa_inscricao ?? 0) || 0
  values.taxaBarraca = Number(values.taxaBarraca ?? values.taxa_barraca ?? 0) || 0
  values.prazoPagamento = Number(values.prazoPagamento ?? values.prazo_pagamento ?? values.prazo_pagamento_h ?? 48) || 48
  values.capacidadeBarracas = Number(values.capacidadeBarracas ?? values.capacidade_barracas ?? 0) || 1
  values.linhas = Number(values.linhas ?? values.linhas ?? 0) || 1
  values.colunas = Number(values.colunas ?? values.colunas ?? 0) || 1

  return values
}

export async function criarFeiraAction(payload: FormData | NovaFeiraPayload) {
  "use server"

  const values = normalizePayload(payload)
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    return { error: authError.message }
  }

  if (!user) {
    return { error: "Não autenticado" }
  }

  console.log("criarFeiraAction payload", values)

  const { data: feira, error: feiraError } = await supabase
    .from("feiras")
    .insert({
      nome: values.nome,
      descricao: values.descricao,
      categorias: values.categorias,
      data_inicio: values.dataInicio,
      data_fim: values.dataFim,
      hora_abertura: values.horaAbertura,
      hora_fechamento: values.horaFechamento,
      endereco: values.endereco,
      cidade: values.cidade,
      estado: values.estado,
      cep: values.cep,
      taxa_inscricao: values.taxaInscricao,
      taxa_barraca: values.taxaBarraca,
      prazo_pagamento_h: values.prazoPagamento,
      capacidade_barracas: values.capacidadeBarracas,
      organizador_id: user.id,
      status: "rascunho",
    })
    .select()
    .single()

  if (feiraError || !feira) {
    return { error: feiraError?.message ?? "Erro ao criar feira" }
  }

  const { error: barracasError } = await supabase.rpc("gerar_barracas", {
    p_feira_id: feira.id,
    p_linhas: values.linhas,
    p_colunas: values.colunas,
  })

  if (barracasError) {
    console.error("Erro ao gerar barracas:", barracasError)
  }

  return { success: true, feiraId: feira.id }
}

export async function editarFeiraAction(feiraId: string, payload: FormData | NovaFeiraPayload) {
  "use server"

  const values = normalizePayload(payload)
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) return { error: authError.message }
  if (!user) return { error: "Não autenticado" }

  const { data: feiraAtual, error: feiraFetchError } = await supabase
    .from("feiras")
    .select("organizador_id, status, data_fim")
    .eq("id", feiraId)
    .single()

  if (feiraFetchError || !feiraAtual) {
    return { error: "Feira não encontrada" }
  }

  if (feiraAtual.organizador_id !== user.id) {
    return { error: "Não autorizado" }
  }

  if (feiraAtual.status === "publicada" && isFeiraEncerradaPorData(feiraAtual.data_fim)) {
    return { error: "Não é possível editar uma feira encerrada" }
  }

  const { error: updateError } = await supabase
    .from("feiras")
    .update({
      nome: values.nome,
      descricao: values.descricao,
      categorias: values.categorias,
      data_inicio: values.dataInicio,
      data_fim: values.dataFim,
      hora_abertura: values.horaAbertura,
      hora_fechamento: values.horaFechamento,
      endereco: values.endereco,
      cidade: values.cidade,
      estado: values.estado,
      cep: values.cep,
      taxa_inscricao: values.taxaInscricao,
      taxa_barraca: values.taxaBarraca,
      prazo_pagamento_h: values.prazoPagamento,
      capacidade_barracas: values.capacidadeBarracas,
    })
    .eq("id", feiraId)

  if (updateError) {
    return { error: updateError.message }
  }

  const admin = createAdminClient()
  const { data: barracasAtuais } = await admin
    .from("barracas")
    .select("linha, coluna, status")
    .eq("feira_id", feiraId)

  const lista = (barracasAtuais ?? []) as Array<{ linha: number; coluna: number; status: string }>
  const temBarracaOcupada = lista.some((b) => b.status === "aprovado")
  const linhasAtuais = lista.reduce((max, b) => Math.max(max, b.linha), 0)
  const colunasAtuais = lista.reduce((max, b) => Math.max(max, b.coluna), 0)
  const gridMudou = values.linhas !== linhasAtuais || values.colunas !== colunasAtuais

  if (gridMudou && !temBarracaOcupada) {
    await admin.from("barracas").delete().eq("feira_id", feiraId)
    const { error: barracasError } = await admin.rpc("gerar_barracas", {
      p_feira_id: feiraId,
      p_linhas: values.linhas,
      p_colunas: values.colunas,
    })
    if (barracasError) {
      console.error("Erro ao regenerar barracas:", barracasError)
    }
  }

  revalidatePath(`/feiras/${feiraId}`)
  revalidatePath(`/feiras/${feiraId}/editar`)
  revalidatePath("/dashboard/organizador/feiras")

  return { success: true, feiraId }
}
