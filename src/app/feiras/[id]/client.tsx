"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { aprovarInscricaoAction, rejeitarInscricaoAction } from "./actions"
import { FEIRA_STATUS_LABEL, resolveFeiraStatusExibicao } from "@/lib/feira-status"

// ─── Types ────────────────────────────────────────────────────────────────────

type Feira = {
  id: string
  nome: string
  status: string
  data_inicio: string
  data_fim: string
  hora_abertura?: string
  hora_fechamento?: string
  cidade: string
  estado?: string
}

type Inscricao = {
  id: string
  nome: string
  status: string
  categoria?: string
  barraca_id?: string | null
  created_at?: string
}

type Barraca = {
  id: string
  numero: number
  linha: number
  coluna: number
  status: string
}

type VisualStatus = "livre" | "pendente" | "aprovado" | "rejeitado" | "bloqueado"

type BarracaEnriquecida = Barraca & {
  numero: number
  visualStatus: VisualStatus
  inscricao?: Inscricao
}

type Props = {
  feira: Feira
  inscricoes: Inscricao[]
  barracas: Barraca[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BOOTH_STATUS_STYLES: Record<VisualStatus, { container: string; label: string; dot: string }> = {
  livre:    { container: "bg-white border-slate-200 hover:border-slate-400",           label: "Livre",    dot: "bg-white border border-slate-300" },
  pendente: { container: "bg-yellow-50 border-yellow-300 hover:border-yellow-500",     label: "Pendente", dot: "bg-yellow-300" },
  aprovado: { container: "bg-green-50 border-green-300 hover:border-green-500",        label: "Aprovado", dot: "bg-green-400" },
  rejeitado:{ container: "bg-red-50 border-red-300 hover:border-red-400",              label: "Rejeitado",dot: "bg-red-400" },
  bloqueado:{ container: "bg-slate-600 border-slate-600 text-white",                   label: "Bloqueado",dot: "bg-slate-400" },
}

const FEIRA_STATUS_STYLES: Record<string, string> = {
  publicada: "bg-green-100 text-green-800 border border-green-200",
  rascunho:  "bg-slate-100 text-slate-700 border border-slate-200",
  encerrada: "bg-red-100 text-red-700 border border-red-200",
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-"
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function resolveVisualStatus(barraca: Barraca, inscricao?: Inscricao): VisualStatus {
  if (barraca.status === "bloqueado" || barraca.status === "indisponivel") return "bloqueado"
  if (!inscricao) return "livre"
  if (inscricao.status === "pendente") return "pendente"
  if (inscricao.status === "aprovado") return "aprovado"
  if (inscricao.status === "rejeitada" || inscricao.status === "rejeitado") return "rejeitado"
  return "livre"
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FeiraDetalheClient({ feira, barracas, inscricoes }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedBarraca, setSelectedBarraca] = useState<BarracaEnriquecida | null>(null)

  // Enrich each barraca with its linked inscricao and computed visual status
  const barracasEnriquecidas: BarracaEnriquecida[] = barracas.map((barraca) => {
    const inscricao = inscricoes.find((insc) => insc.barraca_id === barraca.id)
    return {
      ...barraca,
      visualStatus: resolveVisualStatus(barraca, inscricao),
      inscricao,
    }
  })

  // Metrics — baseados no status da barraca retornado pelo banco
  const totalBarracas = barracas.length
  const ocupadas   = barracas.filter((b) => b.status === "aprovado").length
  const livres     = barracas.filter((b) => b.status === "livre").length
  const pendentes  = barracas.filter((b) => b.status === "pendente").length

  const metrics = [
    { label: "Total de Barracas", value: totalBarracas, color: "text-primary" },
    { label: "Ocupadas",          value: ocupadas,       color: "text-success" },
    { label: "Livres",            value: livres,         color: "text-slate-700"  },
    { label: "Pendentes",         value: pendentes,      color: "text-[#EF9F27]" },
  ]

  const statusExibicao = resolveFeiraStatusExibicao(feira.status, feira.data_fim)
  const feiraStatusClass =
    FEIRA_STATUS_STYLES[statusExibicao] ?? "bg-slate-100 text-slate-700 border border-slate-200"

  function handleClickBarraca(barraca: BarracaEnriquecida) {
    if (barraca.visualStatus === "pendente") {
      setSelectedBarraca(barraca)
    }
  }

  function onAprovar() {
    if (!selectedBarraca?.inscricao) return
    startTransition(async () => {
      const result = await aprovarInscricaoAction({
        inscricaoId: selectedBarraca.inscricao!.id,
        barracaId: selectedBarraca.id,
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Inscrição aprovada com sucesso")
      setSelectedBarraca(null)
      router.refresh()
    })
  }

  function onRejeitar() {
    if (!selectedBarraca?.inscricao) return
    startTransition(async () => {
      const result = await rejeitarInscricaoAction({ inscricaoId: selectedBarraca.inscricao!.id })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Inscrição rejeitada")
      setSelectedBarraca(null)
      router.refresh()
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8 lg:px-12">

      {/* ── TOPO ─────────────────────────────────────────────────────────── */}
      <div className="mb-8 space-y-5">

        {/* Back button */}
        <Link
          href="/dashboard/organizador"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>

        {/* Fair header card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-950">{feira.nome}</h1>
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${feiraStatusClass}`}>
                  {FEIRA_STATUS_LABEL[statusExibicao]}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary" />
                  {feira.cidade}{feira.estado ? `, ${feira.estado}` : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} className="text-primary" />
                  {formatDate(feira.data_inicio)} – {formatDate(feira.data_fim)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {metrics.map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-medium uppercase tracking-widest text-slate-500">{label}</p>
              <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAPA DE BARRACAS ─────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-slate-950">Mapa de Barracas</h2>

        {barracasEnriquecidas.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-500">
            Nenhuma barraca cadastrada para esta feira.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
            {barracasEnriquecidas.map((barraca) => {
              const style = BOOTH_STATUS_STYLES[barraca.visualStatus]
              const clickable = barraca.visualStatus === "pendente"
              return (
                <button
                  key={barraca.id}
                  type="button"
                  disabled={!clickable}
                  onClick={() => handleClickBarraca(barraca)}
                  className={`
                    rounded-2xl border-2 p-3 text-left transition-all
                    ${style.container}
                    ${clickable ? "cursor-pointer hover:shadow-md hover:scale-[1.03] active:scale-[0.98]" : "cursor-default"}
                  `}
                >
                  <p className={`text-sm font-bold ${barraca.visualStatus === "bloqueado" ? "text-white" : "text-slate-900"}`}>
                    #{barraca.numero}
                  </p>
                  {barraca.inscricao?.categoria && (
                    <p className={`mt-1 truncate text-xs ${barraca.visualStatus === "bloqueado" ? "text-slate-300" : "text-slate-500"}`}>
                      {barraca.inscricao.categoria}
                    </p>
                  )}
                  <p className={`mt-1 text-xs font-medium ${barraca.visualStatus === "bloqueado" ? "text-slate-300" : "text-slate-500"}`}>
                    {style.label}
                  </p>
                </button>
              )
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 border-t border-slate-100 pt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Legenda</p>
          <div className="flex flex-wrap gap-5">
            {(Object.entries(BOOTH_STATUS_STYLES) as [VisualStatus, typeof BOOTH_STATUS_STYLES[VisualStatus]][]).map(
              ([key, { dot, label }]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={`h-3.5 w-3.5 rounded-full ${dot}`} />
                  <span className="text-sm text-slate-600">{label}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── DRAWER – solicitação pendente ─────────────────────────────────── */}
      <Sheet
        open={!!selectedBarraca}
        onOpenChange={(open: boolean) => { if (!open) setSelectedBarraca(null) }}
      >
        <SheetContent side="right">
          <SheetHeader className="border-b border-slate-100 pb-4">
            <SheetTitle>Solicitação de Barraca</SheetTitle>
          </SheetHeader>

          {selectedBarraca?.inscricao && (
            <div className="flex flex-col gap-5 p-4">
              {/* Booth info */}
              <div className="rounded-2xl bg-yellow-50 border border-yellow-200 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-yellow-700">Barraca</p>
                <p className="mt-1 font-semibold text-slate-900">
                  #{selectedBarraca.numero} · L{selectedBarraca.linha} C{selectedBarraca.coluna}
                </p>
              </div>

              {/* Feirante info */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Feirante</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {selectedBarraca.inscricao.nome}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Categoria solicitada</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {selectedBarraca.inscricao.categoria ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Data da inscrição</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {formatDate(selectedBarraca.inscricao.created_at)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={onRejeitar}
                  disabled={isPending}
                  className="flex-1 bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
                >
                  Rejeitar
                </Button>
                <Button
                  onClick={onAprovar}
                  disabled={isPending}
                  className="flex-1 bg-success text-white hover:bg-[#178a65] disabled:opacity-60"
                >
                  Aprovar
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
