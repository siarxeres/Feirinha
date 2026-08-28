import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { FeiraFormWizard } from "../../_components/FeiraFormWizard"
import { resolveFeiraStatusExibicao } from "@/lib/feira-status"

export default async function EditarFeiraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [{ data: feira }, { data: barracas }] = await Promise.all([
    supabase.from("feiras").select("*").eq("id", id).single(),
    supabase.from("barracas").select("linha, coluna, status").eq("feira_id", id),
  ])

  if (!feira) notFound()
  if (feira.organizador_id !== user.id) redirect("/dashboard/organizador/feiras")

  const statusExibicao = resolveFeiraStatusExibicao(feira.status, feira.data_fim)
  if (statusExibicao === "encerrada") redirect(`/feiras/${id}`)

  const listaBarracas = (barracas ?? []) as Array<{ linha: number; coluna: number; status: string }>
  const linhas = listaBarracas.reduce((max, b) => Math.max(max, b.linha), 0) || 5
  const colunas = listaBarracas.reduce((max, b) => Math.max(max, b.coluna), 0) || 5
  const gridBloqueado = listaBarracas.some((b) => b.status === "aprovado")

  return (
    <FeiraFormWizard
      modo="editar"
      feiraId={id}
      valoresIniciais={{
        nome: feira.nome ?? "",
        descricao: feira.descricao ?? "",
        categorias: Array.isArray(feira.categorias) ? feira.categorias : [],
        dataInicio: feira.data_inicio ?? "",
        dataFim: feira.data_fim ?? "",
        horaAbertura: (feira.hora_abertura ?? "").slice(0, 5),
        horaFechamento: (feira.hora_fechamento ?? "").slice(0, 5),
        endereco: feira.endereco ?? "",
        cidade: feira.cidade ?? "",
        estado: feira.estado ?? "RO",
        cep: feira.cep ?? "",
        linhas,
        colunas,
        taxaInscricao: feira.taxa_inscricao ?? 0,
        taxaBarraca: feira.taxa_barraca ?? 0,
        prazoPagamento: feira.prazo_pagamento_h ?? 24,
      }}
      gridBloqueado={gridBloqueado}
      gridBloqueadoMotivo="Não é possível alterar o grid com barracas ocupadas."
    />
  )
}
