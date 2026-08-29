"use client"

import { useState, useTransition } from "react"
import { Bell } from "lucide-react"
import { EmptyState } from "@/components/EmptyState"
import { marcarNotificacoesComoLidas } from "@/lib/notificacoes-actions"

type Notificacao = {
  id: string
  titulo: string
  mensagem: string
  lida: boolean
  created_at: string
}

function tempoRelativo(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (diffMin < 1) return "agora"
  if (diffMin < 60) return `${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `${diffD}d`
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

export function NotificationBell({ notificacoes }: { notificacoes: Notificacao[] }) {
  const [open, setOpen] = useState(false)
  const [lista, setLista] = useState(notificacoes)
  const [, startTransition] = useTransition()

  const temNaoLida = lista.some((n) => !n.lida)

  function handleAbrir() {
    setOpen(true)
    const idsNaoLidas = lista.filter((n) => !n.lida).map((n) => n.id)
    if (idsNaoLidas.length === 0) return

    setLista((prev) => prev.map((n) => ({ ...n, lida: true })))
    startTransition(async () => {
      await marcarNotificacoesComoLidas(idsNaoLidas)
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={handleAbrir}
        aria-label="Notificações"
        className="relative p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
      >
        <Bell size={21} className="text-gray-700" />
        {temNaoLida && (
          <span
            className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2 border-white"
            style={{ backgroundColor: "#E8560A" }}
          />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-[70] mx-auto max-w-md max-h-[75dvh] bg-white rounded-t-3xl flex flex-col overflow-hidden">
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-base text-gray-900">Notificações</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-500 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2 pb-6">
              {lista.length === 0 ? (
                <EmptyState
                  icon={Bell}
                  title="Nenhuma notificação por enquanto"
                  description="Quando algo importante acontecer, você vê aqui."
                />
              ) : (
                <div className="divide-y divide-gray-100">
                  {lista.map((n) => (
                    <div key={n.id} className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900">{n.titulo}</p>
                        <span className="text-xs text-gray-400 shrink-0 mt-0.5">{tempoRelativo(n.created_at)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{n.mensagem}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
