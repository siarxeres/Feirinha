'use client'
import { useState, useTransition } from 'react'
import { CheckCircle2, XCircle, ChevronDown } from 'lucide-react'
import { aprovarInscricao, rejeitarInscricao } from '../actions'

type Profile = { nome?: string | null } | null
type Inscricao = {
  id: string
  status: string
  categoria?: string | null
  subcategoria?: string | null
  profiles?: Profile | Profile[]
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

function nomeDo(insc: Inscricao) {
  const p = Array.isArray(insc.profiles) ? insc.profiles[0] : insc.profiles
  return p?.nome ?? 'Feirante'
}

export function InscricoesAguardando({
  inscricoes,
  totalPendentes,
}: {
  inscricoes: Inscricao[]
  totalPendentes: number
}) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [done, setDone] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const visible = inscricoes.filter(i => !done.has(i.id))
  const extra = totalPendentes - inscricoes.length

  const act = (id: string, fn: (id: string) => Promise<unknown>) => {
    startTransition(async () => {
      await fn(id)
      setDone(prev => new Set([...prev, id]))
      setExpanded(null)
    })
  }

  if (visible.length === 0 && totalPendentes === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">Nenhuma inscrição pendente</p>
    )
  }

  return (
    <div>
      <div className="divide-y divide-gray-100">
        {visible.map(insc => {
          const nome = nomeDo(insc)
          const isOpen = expanded === insc.id
          const cat = [insc.categoria, insc.subcategoria].filter(Boolean).join(' · ')

          return (
            <div key={insc.id}>
              <button
                className="w-full flex items-center gap-3 py-3 text-left active:bg-gray-50 transition-colors"
                onClick={() => setExpanded(isOpen ? null : insc.id)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0 ${avatarBg(nome, insc.id)}`}
                >
                  {initials(nome)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{nome}</p>
                  {cat && <p className="text-xs text-gray-400 truncate">{cat}</p>}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white font-medium shrink-0">
                  Pendente
                </span>
                <ChevronDown
                  size={15}
                  className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="flex gap-2 pb-3 pl-[52px]">
                  <button
                    disabled={isPending}
                    onClick={() => act(insc.id, aprovarInscricao)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    Aprovar
                  </button>
                  <button
                    disabled={isPending}
                    onClick={() => act(insc.id, rejeitarInscricao)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-700 text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    Rejeitar
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {(extra > 0 || (done.size > 0 && visible.length === 0 && totalPendentes > done.size)) && (
        <a
          href="/dashboard/organizador/inscricoes"
          className="flex items-center gap-1 pt-3 border-t border-gray-100 text-sm font-medium text-[#E8560A]"
        >
          + {extra > 0 ? extra : ''} inscrições · Ver todas
        </a>
      )}
    </div>
  )
}
