"use client"

import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"

export default function FeiraDetalheError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <AlertCircle size={32} className="text-red-500" />
      </div>
      <div className="text-center">
        <h1 className="text-xl font-semibold text-slate-900">Algo deu errado</h1>
        <p className="mt-2 text-sm text-slate-500">
          Não foi possível carregar os dados desta feira.
        </p>
        {error.digest && (
          <p className="mt-1 font-mono text-xs text-slate-400">ID: {error.digest}</p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-[#E8560A] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#d04d09] transition-colors"
        >
          Tentar novamente
        </button>
        <Link
          href="/dashboard/organizador"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={15} />
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  )
}
