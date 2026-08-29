'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, MapPin, CalendarDays, Store, SearchX } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'

type Feira = {
  id: string
  nome: string
  cidade: string
  estado: string
  data_inicio: string | null
  data_fim: string | null
  capacidade_barracas: number | null
  foto_capa_url: string | null
  categorias: string[] | null
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function FeiraCard({ feira }: { feira: Feira }) {
  const categorias = Array.isArray(feira.categorias) ? feira.categorias : []

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col overflow-hidden">
      {feira.foto_capa_url ? (
        <div className="h-36 overflow-hidden">
          <img
            src={feira.foto_capa_url}
            alt={feira.nome}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-36 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
          <Store size={40} className="text-[#E8560A] opacity-40" />
        </div>
      )}

      <div className="p-4 flex flex-col flex-1 gap-3">
        <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2">{feira.nome}</h3>

        <div className="space-y-1 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <MapPin size={13} className="shrink-0" />
            {feira.cidade}, {feira.estado}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays size={13} className="shrink-0" />
            {formatDate(feira.data_inicio)} – {formatDate(feira.data_fim)}
          </span>
          <span className="flex items-center gap-1.5">
            <Store size={13} className="shrink-0" />
            {feira.capacidade_barracas ?? '—'} barracas
          </span>
        </div>

        {categorias.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {categorias.slice(0, 3).map(cat => (
              <span
                key={cat}
                className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full border border-orange-100 capitalize"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        <Link
          href={`/feiras/${feira.id}`}
          className="mt-auto block text-center py-2 rounded-xl text-sm font-semibold bg-[#E8560A] text-white hover:bg-[#C4450A] transition-colors"
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  )
}

export function BuscaFeiras({ feiras }: { feiras: Feira[] }) {
  const [query, setQuery] = useState('')

  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return feiras
    return feiras.filter(
      f =>
        f.nome.toLowerCase().includes(q) ||
        f.cidade.toLowerCase().includes(q) ||
        f.estado.toLowerCase().includes(q)
    )
  }, [query, feiras])

  return (
    <div className="space-y-6">
      {/* Campo de busca */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nome ou cidade..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8560A]/30 focus:border-[#E8560A] transition"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label="Limpar busca"
          >
            ✕
          </button>
        )}
      </div>

      {/* Contagem */}
      {query && filtradas.length > 0 && (
        <p className="text-sm text-gray-500">
          {`${filtradas.length} feira${filtradas.length > 1 ? 's' : ''} encontrada${filtradas.length > 1 ? 's' : ''}`}
        </p>
      )}

      {/* Grid */}
      {filtradas.length === 0 && !query ? (
        <EmptyState
          icon={Store}
          title="Nenhuma feira disponível no momento"
          description="Assim que um organizador publicar uma feira, ela aparece aqui."
        />
      ) : filtradas.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nenhuma feira encontrada"
          description="Tente buscar por outro nome ou cidade."
          action={{ label: 'Limpar busca', onClick: () => setQuery('') }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.map(f => (
            <FeiraCard key={f.id} feira={f} />
          ))}
        </div>
      )}
    </div>
  )
}
