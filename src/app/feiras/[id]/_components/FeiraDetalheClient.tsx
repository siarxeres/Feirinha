'use client'

import { useState, useTransition } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { BarracaGrid } from '../BarracaGrid'
import { BottomNav } from '@/app/dashboard/organizador/_components/BottomNav'
import {
  aprovarInscricaoAction,
  rejeitarInscricaoAction,
  enviarComunicadoAction,
  criarDespesaAction,
  editarDespesaAction,
  removerDespesaAction,
} from '../actions'

type Perfil = { nome?: string | null; email?: string | null } | null
type Inscricao = {
  id: string
  status: string
  categoria?: string | null
  subcategoria?: string | null
  barraca_id?: string | null
  profiles?: Perfil | Perfil[]
}
type Barraca = {
  id: string
  numero?: number
  codigo?: string
  categoria?: string
  status: string
  linha: number
  coluna: number
}
type Feira = {
  id: string
  nome?: string | null
  status?: string | null
  cidade?: string | null
  estado?: string | null
  data_inicio?: string | null
  horario_inicio?: string | null
} | null
type Despesa = {
  id: string
  categoria: string
  descricao: string | null
  valor: number
}

type Tab = 'inscricoes' | 'mapa' | 'comunicados' | 'receita' | 'rateio'
type Filtro = 'Todas' | 'Pendentes' | 'Aprovadas'

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

const AVATAR_COLORS = [
  'bg-purple-500', 'bg-blue-500', 'bg-green-500',
  'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-teal-500',
]

function initials(name: string | null | undefined) {
  if (!name) return '?'
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

function avatarBg(name: string | null | undefined, id: string) {
  const seed = (name?.charCodeAt(0) ?? 0) + (id.charCodeAt(0) ?? 0)
  return AVATAR_COLORS[seed % AVATAR_COLORS.length]
}

function nomeDo(insc: Inscricao): string {
  const p = Array.isArray(insc.profiles) ? insc.profiles[0] : insc.profiles
  return p?.nome ?? 'Feirante'
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pendente: 'Pendente',
    aprovada: 'Aprovada',
    aprovado: 'Aprovado',
    rejeitada: 'Rejeitada',
    rejeitado: 'Rejeitado',
  }
  return map[status] ?? status
}

function statusBadgeClass(status: string): string {
  if (status === 'pendente') return 'bg-yellow-100 text-yellow-700'
  if (status === 'aprovada' || status === 'aprovado') return 'bg-green-100 text-green-700'
  if (status === 'rejeitada' || status === 'rejeitado') return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-600'
}

function fairaBadgeClass(status?: string | null): string {
  if (status === 'ativa') return 'bg-green-100 text-green-700'
  if (status === 'encerrada') return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-600'
}

export function FeiraDetalheClient({
  feiraId,
  feira,
  barracas,
  inscricoes,
  despesas,
}: {
  feiraId: string
  feira: Feira
  barracas: Barraca[]
  inscricoes: Inscricao[]
  despesas: Despesa[]
}) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('inscricoes')
  const [filtro, setFiltro] = useState<Filtro>('Todas')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [done, setDone] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [mensagem, setMensagem] = useState('')
  const [destinatario, setDestinatario] = useState<'Todos' | 'Aprovados' | 'Lista de espera'>('Todos')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [comunicadoErro, setComunicadoErro] = useState<string | null>(null)
  const [showDespesaForm, setShowDespesaForm] = useState(false)
  const [editingDespesaId, setEditingDespesaId] = useState<string | null>(null)
  const [despesaForm, setDespesaForm] = useState({ categoria: 'energia', descricao: '', valor: '' })
  const [despesaErro, setDespesaErro] = useState<string | null>(null)

  const totalInscricoes = inscricoes.length
  const aprovadas = inscricoes.filter(i => ['aprovado', 'aprovada'].includes(i.status)).length
  const pendentes = inscricoes.filter(i => i.status === 'pendente').length

  const dataInicio = feira?.data_inicio
    ? new Date(feira.data_inicio).toLocaleDateString('pt-BR')
    : '—'
  const horario = feira?.horario_inicio
    ? feira.horario_inicio.slice(0, 5)
    : '—'

  const filtered = inscricoes.filter(i => {
    if (done.has(i.id)) return false
    if (filtro === 'Pendentes') return i.status === 'pendente'
    if (filtro === 'Aprovadas') return ['aprovado', 'aprovada'].includes(i.status)
    return true
  })

  const inscricoesPendentes = inscricoes.filter(i => i.status === 'pendente')

  function handleAprovar(inscricaoId: string) {
    startTransition(async () => {
      const result = await aprovarInscricaoAction({ inscricaoId, barracaId: null })
      if (!result?.error) {
        setDone(prev => new Set([...prev, inscricaoId]))
        setExpanded(null)
        router.refresh()
      }
    })
  }

  function handleRejeitar(inscricaoId: string) {
    startTransition(async () => {
      const result = await rejeitarInscricaoAction({ inscricaoId })
      if (!result?.error) {
        setDone(prev => new Set([...prev, inscricaoId]))
        setExpanded(null)
        router.refresh()
      }
    })
  }

  async function handleEnviar() {
    if (!mensagem.trim() || sending) return
    setSending(true)
    setComunicadoErro(null)
    const result = await enviarComunicadoAction({ feiraId, destinatario, mensagem })
    setSending(false)
    if (result?.error) {
      setComunicadoErro(result.error)
      return
    }
    setMensagem('')
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  const totalDespesas = despesas.reduce((sum, d) => sum + Number(d.valor), 0)
  const valorPorFeirante = aprovadas > 0 ? totalDespesas / aprovadas : null
  const despesasPorCategoria = despesas.reduce<Record<string, Despesa[]>>((acc, d) => {
    ;(acc[d.categoria] ??= []).push(d)
    return acc
  }, {})

  function handleNovaDespesa() {
    setEditingDespesaId(null)
    setDespesaForm({ categoria: 'energia', descricao: '', valor: '' })
    setDespesaErro(null)
    setShowDespesaForm(true)
  }

  function handleEditarDespesaClick(d: Despesa) {
    setEditingDespesaId(d.id)
    setDespesaForm({ categoria: d.categoria, descricao: d.descricao ?? '', valor: String(d.valor) })
    setDespesaErro(null)
    setShowDespesaForm(true)
  }

  function handleSalvarDespesa() {
    const valorNum = Number(despesaForm.valor.replace(',', '.'))
    if (!valorNum || valorNum <= 0) {
      setDespesaErro('Informe um valor válido.')
      return
    }
    setDespesaErro(null)
    startTransition(async () => {
      const result = editingDespesaId
        ? await editarDespesaAction({
            despesaId: editingDespesaId,
            categoria: despesaForm.categoria,
            descricao: despesaForm.descricao.trim() || null,
            valor: valorNum,
          })
        : await criarDespesaAction({
            feiraId,
            categoria: despesaForm.categoria,
            descricao: despesaForm.descricao.trim() || null,
            valor: valorNum,
          })

      if (result?.error) {
        setDespesaErro(result.error)
        return
      }
      setShowDespesaForm(false)
      setEditingDespesaId(null)
      router.refresh()
    })
  }

  function handleRemoverDespesa(despesaId: string) {
    if (!confirm('Remover esta despesa?')) return
    startTransition(async () => {
      const result = await removerDespesaAction({ despesaId })
      if (!result?.error) router.refresh()
    })
  }

  const metricCards: { label: string; value: string | number; style: CSSProperties }[] = [
    { label: 'Inscrições', value: totalInscricoes, style: { border: '2px solid #fed7aa', backgroundColor: '#fff7ed' } },
    { label: 'Aprovadas',  value: aprovadas,       style: { border: '2px solid #bbf7d0', backgroundColor: '#f0fdf4' } },
    { label: 'Pendentes',  value: pendentes,        style: { border: '2px solid #fef08a', backgroundColor: '#fefce8' } },
    { label: 'Receita',    value: 'R$0',            style: { border: '2px solid #bfdbfe', backgroundColor: '#eff6ff' } },
  ]

  const tabs: { key: Tab; label: string }[] = [
    { key: 'inscricoes',  label: 'Inscrições'  },
    { key: 'mapa',        label: 'Mapa'        },
    { key: 'comunicados', label: 'Comunicados' },
    { key: 'receita',     label: 'Receita'     },
    { key: 'rateio',      label: 'Rateio'      },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col">

        {/* Header */}
        <header className="px-4 pt-12 pb-3 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/dashboard/organizador/feiras"
              className="text-gray-500 p-1 -ml-1 rounded-lg hover:bg-gray-100 transition-colors text-xl leading-none"
            >
              ←
            </Link>
            <h1 className="text-lg font-bold text-gray-900 flex-1 truncate">
              {feira?.nome ?? 'Feira'}
            </h1>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${fairaBadgeClass(feira?.status)}`}>
              {feira?.status ?? '—'}
            </span>
          </div>
          <p className="text-sm text-gray-500 pl-1">
            {dataInicio} · {feira?.cidade ?? '—'} · {horario}
          </p>
        </header>

        {/* Metric cards */}
        <div className="px-4 py-3 grid grid-cols-4 gap-2 bg-white">
          {metricCards.map(m => (
            <div key={m.label} className="rounded-xl p-2.5 text-center" style={m.style}>
              <p className="text-[10px] font-semibold text-gray-600 leading-tight mb-1">{m.label}</p>
              <p className="text-2xl font-bold text-gray-900">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex bg-white">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-3 text-xs font-semibold transition-colors border-b-2"
              style={{
                color: tab === t.key ? '#E8560A' : '#6B7280',
                borderColor: tab === t.key ? '#E8560A' : 'transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-4 pb-28">

          {/* Inscrições */}
          {tab === 'inscricoes' && (
            <div>
              <div className="flex gap-2 py-3">
                {(['Todas', 'Pendentes', 'Aprovadas'] as Filtro[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setFiltro(f)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                    style={
                      filtro === f
                        ? { backgroundColor: '#E8560A', color: '#fff' }
                        : { backgroundColor: '#f3f4f6', color: '#4b5563' }
                    }
                  >
                    {f}
                  </button>
                ))}
              </div>

              {filtered.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-10">Nenhuma inscrição</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filtered.map(insc => {
                    const nome = nomeDo(insc)
                    const cat = [insc.categoria, insc.subcategoria].filter(Boolean).join(' · ')
                    const isOpen = expanded === insc.id
                    const isPendente = insc.status === 'pendente'

                    return (
                      <div key={insc.id}>
                        <button
                          className="w-full flex items-center gap-3 py-3 text-left active:bg-gray-50 transition-colors"
                          onClick={() => isPendente && setExpanded(isOpen ? null : insc.id)}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${avatarBg(nome, insc.id)}`}
                          >
                            {initials(nome)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{nome}</p>
                            {cat && <p className="text-xs text-gray-400 truncate">{cat}</p>}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusBadgeClass(insc.status)}`}>
                            {statusLabel(insc.status)}
                          </span>
                          {isPendente && (
                            <ChevronDown
                              size={15}
                              className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            />
                          )}
                        </button>

                        {isOpen && isPendente && (
                          <div className="flex gap-2 pb-3 pl-[52px]">
                            <button
                              disabled={isPending}
                              onClick={() => handleAprovar(insc.id)}
                              className="flex-1 flex items-center justify-center py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                              Aprovar
                            </button>
                            <button
                              disabled={isPending}
                              onClick={() => handleRejeitar(insc.id)}
                              className="flex-1 flex items-center justify-center py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                              Rejeitar
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Mapa */}
          {tab === 'mapa' && (
            <div className="py-3">
              {barracas.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-10">Nenhuma barraca cadastrada</p>
              ) : (
                <>
                  <BarracaGrid barracas={barracas} inscricoes={inscricoesPendentes as any} />
                  <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full border-2 border-gray-300 inline-block" />Livre
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />Pendente
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />Aprovado
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />Rejeitado
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-gray-400 inline-block" />Bloqueado
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Comunicados */}
          {tab === 'comunicados' && (
            <div className="space-y-4 py-3">
              <textarea
                value={mensagem}
                onChange={e => setMensagem(e.target.value)}
                placeholder="Escreva um comunicado para os feirantes..."
                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-32 focus:outline-none focus:border-orange-400 transition-colors"
              />

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Destinatários</p>
                <div className="flex flex-wrap gap-2">
                  {(['Todos', 'Aprovados', 'Lista de espera'] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setDestinatario(d)}
                      className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                      style={
                        destinatario === d
                          ? { backgroundColor: '#E8560A', color: '#fff' }
                          : { backgroundColor: '#f3f4f6', color: '#4b5563' }
                      }
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {sent && (
                <p className="text-sm text-green-600 bg-green-50 rounded-xl px-4 py-2.5 text-center font-medium">
                  Comunicado enviado!
                </p>
              )}

              {comunicadoErro && (
                <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5 text-center font-medium">
                  {comunicadoErro}
                </p>
              )}

              <button
                onClick={handleEnviar}
                disabled={sending || !mensagem.trim()}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#E8560A', color: '#fff' }}
              >
                {sending ? 'Enviando…' : 'Enviar comunicado'}
              </button>
            </div>
          )}

          {/* Receita */}
          {tab === 'receita' && (
            <div className="space-y-4 py-3">
              <div className="rounded-xl p-4" style={{ border: '2px solid #bfdbfe', backgroundColor: '#eff6ff' }}>
                <p className="text-sm font-semibold text-gray-700 mb-1">Potencial arrecadado</p>
                <p className="text-3xl font-bold text-gray-900 mb-3">R$ 0,00</p>
                <div className="w-full bg-blue-100 rounded-full h-2.5">
                  <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '0%' }} />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">0% do potencial total</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-800 mb-3">Transações recentes</p>
                <p className="text-sm text-gray-400 text-center py-8">Nenhuma transação registrada</p>
              </div>
            </div>
          )}

          {/* Rateio */}
          {tab === 'rateio' && (
            <div className="space-y-4 py-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl p-2.5 text-center" style={{ border: '2px solid #fed7aa', backgroundColor: '#fff7ed' }}>
                  <p className="text-[10px] font-semibold text-gray-600 leading-tight mb-1">Total</p>
                  <p className="text-sm font-bold text-gray-900">{formatBRL(totalDespesas)}</p>
                </div>
                <div className="rounded-xl p-2.5 text-center" style={{ border: '2px solid #bfdbfe', backgroundColor: '#eff6ff' }}>
                  <p className="text-[10px] font-semibold text-gray-600 leading-tight mb-1">Inscritos</p>
                  <p className="text-sm font-bold text-gray-900">{aprovadas}</p>
                </div>
                <div className="rounded-xl p-2.5 text-center" style={{ border: '2px solid #bbf7d0', backgroundColor: '#f0fdf4' }}>
                  <p className="text-[10px] font-semibold text-gray-600 leading-tight mb-1">Por feirante</p>
                  <p className="text-xs font-bold text-gray-900 leading-tight">
                    {valorPorFeirante !== null ? formatBRL(valorPorFeirante) : 'Aguardando inscritos'}
                  </p>
                </div>
              </div>

              {!showDespesaForm && (
                <button
                  onClick={handleNovaDespesa}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={{ backgroundColor: '#E8560A', color: '#fff' }}
                >
                  + Lançar despesa
                </button>
              )}

              {showDespesaForm && (
                <div className="rounded-xl p-4 space-y-3" style={{ border: '2px solid #e5e7eb' }}>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Categoria</label>
                    <select
                      value={despesaForm.categoria}
                      onChange={e => setDespesaForm(f => ({ ...f, categoria: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    >
                      {Object.entries(CATEGORIA_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={despesaForm.valor}
                      onChange={e => setDespesaForm(f => ({ ...f, valor: e.target.value }))}
                      placeholder="0,00"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Descrição (opcional)</label>
                    <input
                      type="text"
                      value={despesaForm.descricao}
                      onChange={e => setDespesaForm(f => ({ ...f, descricao: e.target.value }))}
                      placeholder="Ex.: Conta de luz de julho"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    />
                  </div>
                  {despesaErro && <p className="text-xs text-red-600">{despesaErro}</p>}
                  <div className="flex gap-2">
                    <button
                      disabled={isPending}
                      onClick={handleSalvarDespesa}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                      style={{ backgroundColor: '#E8560A' }}
                    >
                      {editingDespesaId ? 'Salvar alterações' : 'Adicionar'}
                    </button>
                    <button
                      onClick={() => setShowDespesaForm(false)}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {despesas.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-10">Nenhuma despesa lançada</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(despesasPorCategoria).map(([cat, items]) => (
                    <div key={cat}>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">
                        {CATEGORIA_LABELS[cat] ?? cat}
                      </p>
                      <div className="divide-y divide-gray-100 rounded-xl bg-white" style={{ border: '2px solid #e5e7eb' }}>
                        {items.map(d => (
                          <div key={d.id} className="flex items-center justify-between px-3 py-2.5 gap-2">
                            <p className="text-sm text-gray-700 truncate min-w-0">
                              {d.descricao || CATEGORIA_LABELS[cat] || cat}
                            </p>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-sm font-semibold text-gray-900">{formatBRL(Number(d.valor))}</span>
                              <button
                                onClick={() => handleEditarDespesaClick(d)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                                aria-label="Editar despesa"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                disabled={isPending}
                                onClick={() => handleRemoverDespesa(d.id)}
                                className="text-gray-400 hover:text-red-500 p-1 disabled:opacity-50"
                                aria-label="Remover despesa"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        <BottomNav />
      </div>
    </div>
  )
}
