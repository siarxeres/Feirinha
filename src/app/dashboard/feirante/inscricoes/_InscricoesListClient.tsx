"use client"

import { useState } from "react"
import { ClipboardList, MapPin, CalendarDays, Store } from "lucide-react"
import { EmptyState } from "@/components/EmptyState"
import { resolveFeiraStatusExibicao } from "@/lib/feira-status"

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  return new Date(value + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function statusBadge(status: string) {
  if (status === "aprovada")     return { label: "Aprovada",        cls: "bg-green-100 text-green-700" }
  if (status === "pendente")     return { label: "Pendente",        cls: "bg-yellow-100 text-yellow-700" }
  if (status === "rejeitada")    return { label: "Rejeitada",       cls: "bg-red-100 text-red-700" }
  if (status === "lista_espera") return { label: "Lista de espera", cls: "bg-gray-100 text-gray-600" }
  return { label: status, cls: "bg-gray-100 text-gray-600" }
}

const AVATAR_COLORS = ["bg-purple-500", "bg-blue-500", "bg-green-500", "bg-pink-500", "bg-yellow-500", "bg-indigo-500", "bg-teal-500"]

function initials(name: string | null | undefined) {
  if (!name) return "?"
  return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("")
}

function avatarBg(name: string | null | undefined, id: string) {
  const seed = (name?.charCodeAt(0) ?? 0) + (id.charCodeAt(0) ?? 0)
  return AVATAR_COLORS[seed % AVATAR_COLORS.length]
}

type FiltroInscricao = "Ativas" | "Encerradas"

const FILTROS: FiltroInscricao[] = ["Ativas", "Encerradas"]

export function InscricoesListClient({ lista }: { lista: any[] }) {
  const [filtro, setFiltro] = useState<FiltroInscricao>("Ativas")

  if (lista.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Você ainda não se inscreveu em nenhuma feira"
        description="Encontre uma feira publicada perto de você e garanta sua vaga."
        action={{ label: "Ver feiras disponíveis", href: "/dashboard/feirante" }}
        card
      />
    )
  }

  const enriquecida = lista.map((insc) => {
    const feiraData = Array.isArray(insc.feiras) ? insc.feiras[0] : insc.feiras
    const statusExibicao = resolveFeiraStatusExibicao(feiraData?.status, feiraData?.data_fim)
    return { insc, feiraData, encerrada: statusExibicao === "encerrada" }
  })

  const listaFiltrada = enriquecida
    .filter((item) => (filtro === "Ativas" ? !item.encerrada : item.encerrada))
    .sort((a, b) => {
      const dataA = a.feiraData?.data_inicio ?? ""
      const dataB = b.feiraData?.data_inicio ?? ""
      return filtro === "Ativas" ? dataA.localeCompare(dataB) : dataB.localeCompare(dataA)
    })

  return (
    <div className="space-y-3">
      <div className="flex gap-2 pb-1">
        {FILTROS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 ${
              filtro === f ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {listaFiltrada.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={filtro === "Ativas" ? "Nenhuma inscrição ativa" : "Nenhuma inscrição encerrada"}
          description={
            filtro === "Ativas"
              ? "Suas inscrições em feiras publicadas aparecem aqui."
              : "Inscrições de feiras já encerradas vão aparecer aqui."
          }
          card
        />
      ) : (
        <div className="space-y-3">
          {listaFiltrada.map(({ insc, feiraData }) => {
            const nomeFeira = feiraData?.nome ?? "Feira"
            const badge = statusBadge(insc.status)
            const barracaData = Array.isArray(insc.barracas) ? insc.barracas[0] : insc.barracas
            const codigoBarraca = barracaData?.codigo ?? barracaData?.numero ?? null
            return (
              <div
                key={insc.id}
                className="rounded-2xl bg-white shadow-sm overflow-hidden border-2 border-gray-200"
              >
                <div className="flex items-center gap-3 p-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${avatarBg(nomeFeira, insc.id)}`}>
                    {initials(nomeFeira)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{nomeFeira}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {feiraData?.cidade && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={11} />
                          {feiraData.cidade}, {feiraData.estado}
                        </span>
                      )}
                      {feiraData?.data_inicio && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <CalendarDays size={11} />
                          {formatDate(feiraData.data_inicio)} – {formatDate(feiraData.data_fim)}
                        </span>
                      )}
                      {insc.status === "aprovada" && codigoBarraca && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                          <Store size={11} />
                          Barraca #{codigoBarraca}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
