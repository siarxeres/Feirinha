"use client"

import { useState, useMemo } from "react"
import { Search, MapPin, CalendarDays, Navigation, Store, SearchX } from "lucide-react"
import { EmptyState } from "@/components/EmptyState"

type Feira = {
  id: string
  nome: string
  cidade: string
  estado: string
  endereco: string | null
  data_inicio: string | null
  data_fim: string | null
  categorias: string[] | null
  foto_capa_url: string | null
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  return new Date(value + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  })
}

export function MapaFeirasClient({ feiras }: { feiras: Feira[] }) {
  const [query, setQuery] = useState("")
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string | null>(null)

  const cidades = useMemo(
    () => Array.from(new Set(feiras.map(f => f.cidade).filter(Boolean))).sort(),
    [feiras]
  )

  const filtradas = useMemo(() => {
    let result = feiras
    if (cidadeSelecionada) result = result.filter(f => f.cidade === cidadeSelecionada)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      result = result.filter(
        f =>
          f.nome.toLowerCase().includes(q) ||
          f.cidade.toLowerCase().includes(q) ||
          f.estado.toLowerCase().includes(q)
      )
    }
    return result
  }, [feiras, query, cidadeSelecionada])

  return (
    <>
      {/* Search */}
      <div className="px-5 mb-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nome ou cidade..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8560A]/30 focus:border-[#E8560A] transition"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg leading-none"
              aria-label="Limpar busca"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* City chips */}
      {cidades.length > 1 && (
        <div className="mb-4">
          <div
            className="flex gap-2 overflow-x-auto px-5 pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            <button
              onClick={() => setCidadeSelecionada(null)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={
                !cidadeSelecionada
                  ? { backgroundColor: "#E8560A", color: "white" }
                  : { backgroundColor: "#f3f4f6", color: "#374151" }
              }
            >
              Todas
            </button>
            {cidades.map(cidade => (
              <button
                key={cidade}
                onClick={() => setCidadeSelecionada(c => (c === cidade ? null : cidade))}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={
                  cidadeSelecionada === cidade
                    ? { backgroundColor: "#E8560A", color: "white" }
                    : { backgroundColor: "#f3f4f6", color: "#374151" }
                }
              >
                {cidade}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Count */}
      {(query || cidadeSelecionada) && (
        <p className="px-5 mb-3 text-xs text-gray-500">
          {filtradas.length} feira{filtradas.length !== 1 ? "s" : ""} encontrada{filtradas.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* List */}
      <div className="flex-1 px-5 pb-28 space-y-3">
        {filtradas.length === 0 ? (
          query || cidadeSelecionada ? (
            <EmptyState
              icon={SearchX}
              title="Nenhuma feira encontrada"
              description="Tente buscar por outro nome, cidade ou limpar os filtros."
              action={{ label: "Limpar filtros", onClick: () => { setQuery(""); setCidadeSelecionada(null) } }}
              card
            />
          ) : (
            <EmptyState
              icon={MapPin}
              title="Nenhuma feira publicada no momento"
              description="Assim que um organizador publicar uma feira, ela aparece aqui no mapa."
              card
            />
          )
        ) : (
          filtradas.map(feira => {
            const local = [feira.endereco, feira.cidade, feira.estado].filter(Boolean).join(", ")
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(local)}`
            const categorias = Array.isArray(feira.categorias) ? feira.categorias : []

            return (
              <div
                key={feira.id}
                className="rounded-2xl bg-white shadow-sm overflow-hidden"
                style={{ border: "2px solid #e5e7eb" }}
              >
                {feira.foto_capa_url ? (
                  <div className="h-20 overflow-hidden">
                    <img
                      src={feira.foto_capa_url}
                      alt={feira.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="h-14 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)" }}
                  >
                    <Store size={20} className="text-[#E8560A] opacity-60" />
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{feira.nome}</p>
                      <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <MapPin size={10} className="shrink-0" />
                        <span className="truncate">{local}</span>
                      </p>
                    </div>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#E8560A" }}
                    >
                      <Navigation size={11} />
                      Ver no Mapa
                    </a>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                    <CalendarDays size={11} className="shrink-0" />
                    <span>{formatDate(feira.data_inicio)} – {formatDate(feira.data_fim)}</span>
                  </div>

                  {categorias.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {categorias.slice(0, 3).map(cat => (
                        <span
                          key={cat}
                          className="text-xs px-2 py-0.5 rounded-full capitalize"
                          style={{
                            backgroundColor: "#fff7ed",
                            color: "#c2410c",
                            border: "1px solid #fed7aa",
                          }}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
