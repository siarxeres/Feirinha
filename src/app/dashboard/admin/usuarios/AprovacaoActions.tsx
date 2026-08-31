"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, XCircle } from "lucide-react"
import { aprovarFeirante, rejeitarFeirante } from "./actions"
import { toast } from "sonner"

interface Props {
  feiranteId: string
  aprovacaoStatus: string | null
}

export function AprovacaoActions({ feiranteId, aprovacaoStatus }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  if (aprovacaoStatus !== "aguardando_aprovacao") return null

  const handleAprovar = () => {
    startTransition(async () => {
      const result = await aprovarFeirante(feiranteId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Feirante aprovado com sucesso!")
        router.refresh()
      }
    })
  }

  const handleRejeitar = () => {
    startTransition(async () => {
      const result = await rejeitarFeirante(feiranteId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Feirante rejeitado.")
        router.refresh()
      }
    })
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleAprovar}
        disabled={isPending}
        title="Aprovar feirante"
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
        style={{ backgroundColor: "var(--success)" }}
      >
        <CheckCircle2 size={13} />
        Aprovar
      </button>
      <button
        onClick={handleRejeitar}
        disabled={isPending}
        title="Rejeitar feirante"
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50 bg-red-500"
      >
        <XCircle size={13} />
        Rejeitar
      </button>
    </div>
  )
}
