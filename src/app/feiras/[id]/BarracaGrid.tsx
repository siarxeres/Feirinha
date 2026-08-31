'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { aprovarInscricaoAction, rejeitarInscricaoAction } from './actions'

type Barraca = {
  id: string
  codigo?: string
  numero?: number
  categoria?: string
  status: string
  linha: number
  coluna: number
}

type Perfil = {
  nome: string
  email: string
  whatsapp?: string | null
}

type Inscricao = {
  id: string
  barraca_id: string | null
  status: string
  mensagem?: string | null
  feirante_id: string
  profiles: Perfil | Perfil[] | null
}

function perfilDe(insc: Inscricao | undefined): Perfil | null {
  if (!insc) return null
  return Array.isArray(insc.profiles) ? (insc.profiles[0] ?? null) : insc.profiles
}

const gridColor: Record<string, string> = {
  livre:        'bg-white border-2 border-gray-200',
  pendente:     'bg-yellow-50 border-2 border-yellow-400',
  aprovado:     'bg-green-50 border-2 border-green-400',
  rejeitado:    'bg-red-50 border-2 border-red-400',
  bloqueado:    'bg-gray-300 border-2 border-gray-400',
  reservada:    'bg-yellow-50 border-2 border-yellow-400',
  ocupada:      'bg-green-50 border-2 border-green-400',
  indisponivel: 'bg-gray-300 border-2 border-gray-400',
}

const badgeColor: Record<string, string> = {
  livre:        'bg-gray-100 text-gray-600',
  pendente:     'bg-yellow-100 text-yellow-700',
  aprovado:     'bg-green-100 text-green-700',
  rejeitado:    'bg-red-100 text-red-700',
  bloqueado:    'bg-gray-200 text-gray-600',
  reservada:    'bg-yellow-100 text-yellow-700',
  ocupada:      'bg-green-100 text-green-700',
  indisponivel: 'bg-gray-200 text-gray-600',
}

const statusLabel: Record<string, string> = {
  livre:     'Livre',
  pendente:  'Pendente',
  aprovado:  'Ocupada',
  rejeitado: 'Rejeitado',
  bloqueado: 'Bloqueado',
}

function inscricaoDaBarraca(inscricoes: Inscricao[], barracaId: string): Inscricao | undefined {
  return inscricoes.find(i => i.barraca_id === barracaId)
}

function statusEfetivo(barraca: Barraca, inscricoes: Inscricao[]): string {
  const insc = inscricaoDaBarraca(inscricoes, barraca.id)
  if (!insc) return barraca.status
  if (insc.status === 'aprovada' || insc.status === 'aprovado') return 'aprovado'
  if (insc.status === 'rejeitada' || insc.status === 'rejeitado') return 'rejeitado'
  return 'pendente'
}

export function BarracaGrid({
  barracas,
  inscricoes,
}: {
  barracas: Barraca[]
  inscricoes: Inscricao[]
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<Barraca | null>(null)
  const [isPending, startTransition] = useTransition()
  const [actionError, setActionError] = useState<string | null>(null)

  const inscricaoVinculada = selected
    ? inscricaoDaBarraca(inscricoes, selected.id)
    : undefined

  const inscricaoPendente = inscricaoVinculada?.status === 'pendente' ? inscricaoVinculada : undefined

  const statusDrawer = selected ? statusEfetivo(selected, inscricoes) : ''

  function fechar() {
    setSelected(null)
    setActionError(null)
  }

  function handleAprovar() {
    if (!inscricaoPendente || !selected) return
    setActionError(null)
    startTransition(async () => {
      const result = await aprovarInscricaoAction({
        inscricaoId: inscricaoPendente.id,
        barracaId: selected.id,
      })
      if (result?.error) {
        setActionError(result.error)
      } else {
        fechar()
        router.refresh()
      }
    })
  }

  function handleRejeitar() {
    if (!inscricaoPendente) return
    setActionError(null)
    startTransition(async () => {
      const result = await rejeitarInscricaoAction({ inscricaoId: inscricaoPendente.id })
      if (result?.error) {
        setActionError(result.error)
      } else {
        fechar()
        router.refresh()
      }
    })
  }

  const label = selected
    ? (selected.codigo ?? (selected.numero != null ? `B${selected.numero}` : 'Barraca'))
    : ''

  return (
    <>
      <div className="grid grid-cols-5 gap-3">
        {barracas.map(b => {
          const status = statusEfetivo(b, inscricoes)
          const insc = inscricaoDaBarraca(inscricoes, b.id)
          const subtitulo = status === 'aprovado' ? (perfilDe(insc)?.nome ?? 'Ocupada') : (b.categoria ?? '—')
          return (
            <button
              key={b.id}
              onClick={() => { setActionError(null); setSelected(b) }}
              className={`rounded-lg p-3 text-left hover:opacity-80 transition active:scale-95 ${gridColor[status] ?? 'bg-gray-100 border-2 border-gray-300'}`}
            >
              <p className="font-bold text-sm">#{b.numero ?? b.codigo}</p>
              <p className="text-xs text-gray-500 truncate">{subtitulo}</p>
              <p className="text-xs text-gray-400">{statusLabel[status] ?? status}</p>
            </button>
          )
        })}
      </div>

      {selected && (
        <>
          <div className="fixed inset-0 bg-black/20 z-[60]" onClick={fechar} />

          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-[70] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-semibold text-lg">Barraca {label}</h3>
              <button
                onClick={fechar}
                aria-label="Fechar"
                className="p-1 rounded hover:bg-gray-100 transition active:scale-95 text-gray-500 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 flex-1 flex flex-col gap-5 overflow-y-auto">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Número</p>
                <p className="font-medium">{selected.numero ?? selected.codigo ?? '—'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Categoria</p>
                <p className="font-medium capitalize">{selected.categoria ?? 'Não definida'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${badgeColor[statusDrawer] ?? 'bg-gray-100 text-gray-600'}`}>
                  {statusLabel[statusDrawer] ?? statusDrawer}
                </span>
              </div>

              {inscricaoVinculada && (
                <>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Feirante</p>
                    <p className="font-medium">{perfilDe(inscricaoVinculada)?.nome ?? '—'}</p>
                    <p className="text-xs text-gray-500">{perfilDe(inscricaoVinculada)?.email}</p>
                    {perfilDe(inscricaoVinculada)?.whatsapp && (
                      <p className="text-xs text-gray-500">{perfilDe(inscricaoVinculada)?.whatsapp}</p>
                    )}
                  </div>

                  {inscricaoVinculada.mensagem && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Mensagem</p>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                        {inscricaoVinculada.mensagem}
                      </p>
                    </div>
                  )}
                </>
              )}

              {actionError && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{actionError}</p>
              )}

              <div className="mt-auto flex flex-col gap-2 pb-4">
                {inscricaoPendente ? (
                  <>
                    <button
                      onClick={handleAprovar}
                      disabled={isPending}
                      className="w-full py-2.5 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 disabled:opacity-50 transition active:scale-95"
                    >
                      {isPending ? 'Processando…' : 'Aprovar'}
                    </button>
                    <button
                      onClick={handleRejeitar}
                      disabled={isPending}
                      className="w-full py-2.5 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50 transition active:scale-95"
                    >
                      {isPending ? 'Processando…' : 'Rejeitar'}
                    </button>
                  </>
                ) : statusDrawer === 'aprovado' ? (
                  <p className="text-sm text-gray-500 text-center py-4">Barraca ocupada</p>
                ) : selected.status === 'livre' ? (
                  <p className="text-sm text-gray-500 text-center py-4">Barraca disponível</p>
                ) : null}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
