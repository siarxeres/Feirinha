"use server"

import { createClient } from "@/lib/supabase/server"

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
