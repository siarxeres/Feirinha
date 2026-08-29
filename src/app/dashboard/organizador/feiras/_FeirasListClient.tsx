"use client"

import { useState } from "react"
import Link from "next/link"
import { Store } from "lucide-react"
import { PublicarButton } from "./_PublicarButton"
import { FEIRA_STATUS_LABEL, resolveFeiraStatusExibicao } from "@/lib/feira-status"
import { EmptyState } from "@/components/EmptyState"

const STATUS_STYLE: Record<string, string> = {
  rascunho: "bg-gray-100 text-gray-700",
  publicada: "bg-green-100 text-green-700",
  encerrada: "bg-red-100 text-red-700",
}

type Feira = {
  id: string
  nome: string
  status: string
  data_inicio: string | null
  data_fim: string | null
  categorias: string[] | null
}

type FiltroFeira = "Ativas" | "Encerradas" | "Todas"

const FILTROS: FiltroFeira[] = ["Ativas", "Encerradas", "Todas"]

function formatData(dataInicio: string | null, dataFim: string | null) {
  if (!dataInicio) return "Data não definida"
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" }
  const inicio = new Date(`${dataInicio}T00:00:00`).toLocaleDateString("pt-BR", opts)
  if (!dataFim || dataFim === dataInicio) return inicio
  const fim = new Date(`${dataFim}T00:00:00`).toLocaleDateString("pt-BR", opts)
  return `${inicio} – ${fim}`
}

export function FeirasListClient({ lista }: { lista: Feira[] }) {
  const [filtro, setFiltro] = useState<FiltroFeira>("Ativas")

  const listaFiltrada = lista.filter((feira) => {
    const statusExibicao = resolveFeiraStatusExibicao(feira.status, feira.data_fim)
    if (filtro === "Ativas") return statusExibicao !== "encerrada"
    if (filtro === "Encerradas") return statusExibicao === "encerrada"
    return true
  })

  if (lista.length === 0) {
    return (
      <EmptyState
        icon={Store}
        title="Você ainda não criou nenhuma feira"
        description="Crie sua primeira feira para começar a receber inscrições."
        action={{ label: "Criar feira", href: "/feiras/nova" }}
        card
      />
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 pb-1 -mt-1">
        {FILTROS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={
              filtro === f
                ? { backgroundColor: "#E8560A", color: "#fff" }
                : { backgroundColor: "#f3f4f6", color: "#4b5563" }
            }
          >
            {f}
          </button>
        ))}
      </div>

      {listaFiltrada.length === 0 ? (
        <EmptyState
          icon={Store}
          title={
            filtro === "Encerradas"
              ? "Nenhuma feira encerrada ainda"
              : filtro === "Ativas"
                ? "Nenhuma feira ativa no momento"
                : "Nenhuma feira por aqui"
          }
          description={
            filtro === "Encerradas"
              ? "As feiras já concluídas vão aparecer aqui."
              : filtro === "Ativas"
                ? "Suas feiras em rascunho ou publicadas aparecem aqui."
                : undefined
          }
          card
        />
      ) : (
        <div className="space-y-3">
          {listaFiltrada.map((feira) => {
            const statusExibicao = resolveFeiraStatusExibicao(feira.status, feira.data_fim)
            const categorias = Array.isArray(feira.categorias) ? feira.categorias : []
            return (
              <Link
                key={feira.id}
                href={`/feiras/${feira.id}`}
                className="rounded-2xl bg-white shadow-sm p-4 flex items-center justify-between gap-3 active:bg-gray-50 transition-colors"
                style={{ border: "2px solid #e5e7eb" }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{feira.nome}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatData(feira.data_inicio, feira.data_fim)}</p>
                  <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full mt-2 font-medium ${STATUS_STYLE[statusExibicao] ?? "bg-gray-100 text-gray-700"}`}>
                    {FEIRA_STATUS_LABEL[statusExibicao] ?? feira.status}
                  </span>
                  {categorias.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {categorias.map((cat) => (
                        <span
                          key={cat}
                          className="text-xs px-2 py-0.5 rounded-full capitalize"
                          style={{ backgroundColor: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" }}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {feira.status === "rascunho" && <PublicarButton feiraId={feira.id} />}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
