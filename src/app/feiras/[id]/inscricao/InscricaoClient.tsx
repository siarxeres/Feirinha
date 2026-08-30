'use client'

import { useState, useTransition, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, ClipboardList, AlertCircle, Receipt } from 'lucide-react'
import Link from 'next/link'
import { inscreverFeirante } from './actions'
import { EmptyState } from '@/components/EmptyState'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'

type Despesa = {
  id: string
  categoria: string
  descricao: string | null
  valor: number
}

type Tab = 'inscricao' | 'rateio'

const CATEGORIA_LABELS: Record<string, string> = {
  energia: 'Energia',
  mesas_cadeiras: 'Mesas e cadeiras',
  limpeza: 'Limpeza',
  som: 'Som',
  outros: 'Outros',
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function statusBadge(status: string) {
  if (status === 'aprovada')     return { label: 'Aprovada',        cls: 'bg-green-100 text-green-700' }
  if (status === 'pendente')     return { label: 'Pendente',        cls: 'bg-yellow-100 text-yellow-700' }
  if (status === 'rejeitada')    return { label: 'Rejeitada',       cls: 'bg-red-100 text-red-700' }
  if (status === 'lista_espera') return { label: 'Lista de espera', cls: 'bg-gray-100 text-gray-600' }
  return { label: status, cls: 'bg-gray-100 text-gray-600' }
}

export function InscricaoClient({
  feiraId,
  jaInscrito,
  statusAtual,
  despesas,
  inscritosCount,
}: {
  feiraId: string
  jaInscrito: boolean
  statusAtual: string | null
  despesas: Despesa[]
  inscritosCount: number
}) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('inscricao')
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  const totalDespesas = despesas.reduce((sum, d) => sum + Number(d.valor), 0)
  const valorPorFeirante = inscritosCount > 0 ? totalDespesas / inscritosCount : null
  const despesasPorCategoria = despesas.reduce<Record<string, Despesa[]>>((acc, d) => {
    ;(acc[d.categoria] ??= []).push(d)
    return acc
  }, {})

  let inscricaoContent: ReactNode

  if (sucesso) {
    inscricaoContent = (
      <Card
        className="p-6 text-center border-2 border-green-200"
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-50"
        >
          <CheckCircle2 size={28} className="text-green-500" />
        </div>
        <p className="text-base font-bold text-gray-900 mb-1">Inscrição enviada!</p>
        <p className="text-sm text-gray-500 mb-5">
          Aguarde a aprovação do organizador da feira.
        </p>
        <Link
          href="/dashboard/feirante/inscricoes"
          className="inline-block text-sm font-semibold px-6 py-3 rounded-xl text-white bg-primary"
        >
          Ver minhas inscrições
        </Link>
      </Card>
    )
  } else if (jaInscrito && statusAtual) {
    const badge = statusBadge(statusAtual)
    inscricaoContent = (
      <Card
        className="p-5 border-2 border-gray-200"
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-primary/10"
          >
            <ClipboardList size={22} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">Você já está inscrito</p>
            <p className="text-xs text-gray-500">nesta feira</p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
        <Link
          href="/dashboard/feirante/inscricoes"
          className="block text-center text-sm font-semibold py-3 rounded-xl text-white bg-primary"
        >
          Ver minhas inscrições
        </Link>
      </Card>
    )
  } else {
    inscricaoContent = (
      <Card
        className="p-5 border-2 border-gray-200"
      >
        <p className="text-sm font-semibold text-gray-900 mb-1">Confirmar inscrição?</p>
        <p className="text-xs text-gray-500 mb-4">
          Sua solicitação ficará como{' '}
          <span className="font-medium text-yellow-700">Pendente</span> até o
          organizador aprová-la.
        </p>

        {erro && (
          <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-red-50 border border-red-100">
            <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{erro}</p>
          </div>
        )}

        <button
          disabled={isPending}
          onClick={() => {
            setErro(null)
            startTransition(async () => {
              const result = await inscreverFeirante(feiraId)
              if (result?.error) {
                setErro(result.error)
              } else {
                setSucesso(true)
                setTimeout(() => router.push('/dashboard/feirante/inscricoes'), 2000)
              }
            })
          }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-60 bg-primary"
        >
          {isPending ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Enviando...
            </>
          ) : (
            'Confirmar inscrição'
          )}
        </button>
      </Card>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'inscricao', label: 'Inscrição' },
    { key: 'rateio', label: 'Rateio' },
  ]

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="gap-0">
      <TabsList variant="line" className="h-auto w-full justify-start rounded-xl bg-white p-0 mb-4 border-2 border-gray-200 overflow-hidden">
        {tabs.map(t => (
          <TabsTrigger
            key={t.key}
            value={t.key}
            className="flex-1 rounded-none border-0 py-3 text-xs font-semibold text-gray-500 after:bg-primary data-active:bg-transparent data-active:text-primary"
          >
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="inscricao">{inscricaoContent}</TabsContent>

      <TabsContent value="rateio">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl p-2.5 text-center border-2 border-primary/20 bg-primary/10">
              <p className="text-[10px] font-semibold text-gray-600 leading-tight mb-1">Total</p>
              <p className="text-sm font-bold text-gray-900">{formatBRL(totalDespesas)}</p>
            </div>
            <div className="rounded-xl p-2.5 text-center" style={{ border: '2px solid #bfdbfe', backgroundColor: '#eff6ff' }}>
              <p className="text-[10px] font-semibold text-gray-600 leading-tight mb-1">Inscritos</p>
              <p className="text-sm font-bold text-gray-900">{inscritosCount}</p>
            </div>
            <div className="rounded-xl p-2.5 text-center" style={{ border: '2px solid #bbf7d0', backgroundColor: '#f0fdf4' }}>
              <p className="text-[10px] font-semibold text-gray-600 leading-tight mb-1">Sua parte</p>
              <p className="text-xs font-bold text-gray-900 leading-tight">
                {valorPorFeirante !== null ? formatBRL(valorPorFeirante) : 'Aguardando inscritos'}
              </p>
            </div>
          </div>

          {despesas.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Nenhuma despesa lançada ainda"
              description="Quando o organizador lançar um custo do rateio, ele aparece aqui."
            />
          ) : (
            <div className="space-y-3">
              {Object.entries(despesasPorCategoria).map(([cat, items]) => (
                <div key={cat}>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">
                    {CATEGORIA_LABELS[cat] ?? cat}
                  </p>
                  <Card className="divide-y divide-gray-100 gap-0 py-0 rounded-xl">
                    {items.map(d => (
                      <div key={d.id} className="flex items-center justify-between px-3 py-2.5 gap-2">
                        <p className="text-sm text-gray-700 truncate min-w-0">
                          {d.descricao || CATEGORIA_LABELS[cat] || cat}
                        </p>
                        <span className="text-sm font-semibold text-gray-900 shrink-0">{formatBRL(Number(d.valor))}</span>
                      </div>
                    ))}
                  </Card>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-50 border border-yellow-100">
            <AlertCircle size={15} className="text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800">
              Pagamento feito diretamente ao organizador. O app ainda não processa este pagamento.
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
