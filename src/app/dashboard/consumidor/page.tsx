import type { ReactNode, CSSProperties } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Store, CalendarDays, Clock, Tag, MapPin } from "lucide-react"
import Link from "next/link"
import { BuscaFeiras } from "./BuscaFeiras"
import { BottomNav } from "./_components/BottomNav"
import { LogoutButton } from "./_components/LogoutButton"
import { NotificationBell } from "@/components/NotificationBell"
import { dataDeHojeISO } from "@/lib/feira-status"

const NOTIFICACOES_LIMIT = 20

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  return new Date(value + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  })
}

function diasRestantes(dataInicio: string | null) {
  if (!dataInicio) return null
  return Math.ceil(
    (new Date(dataInicio + "T00:00:00").getTime() - Date.now()) / 86_400_000
  )
}

export default async function ConsumidorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [{ data: profile }, { data: todasFeiras }, { data: notificacoes }] = await Promise.all([
    supabase.from("profiles").select("nome").eq("id", user.id).single(),
    supabase
      .from("feiras")
      .select("id, nome, cidade, estado, data_inicio, data_fim, capacidade_barracas, foto_capa_url, categorias")
      .eq("status", "publicada")
      .gte("data_fim", dataDeHojeISO())
      .order("data_inicio", { ascending: true }),
    supabase
      .from("notificacoes")
      .select("id, titulo, mensagem, lida, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(NOTIFICACOES_LIMIT),
  ])

  const nome = (profile as any)?.nome || user.user_metadata?.nome || user.email || "visitante"
  const feiras = (todasFeiras ?? []) as any[]

  const hoje = new Date().toISOString().slice(0, 10)
  const seteDias = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10)

  const emBreve = feiras.filter(f => f.data_inicio && f.data_inicio >= hoje)
  const estaSemana = feiras.filter(f => f.data_inicio && f.data_inicio >= hoje && f.data_inicio <= seteDias)
  const categoriasUnicas = new Set(feiras.flatMap(f => Array.isArray(f.categorias) ? f.categorias : []))
  const destaques = emBreve.slice(0, 6)

  const metrics: {
    label: string
    value: number
    icon: ReactNode
    className?: string
    style?: CSSProperties
  }[] = [
    {
      label: "Feiras",
      value: feiras.length,
      icon: <Store size={18} className="text-orange-500" />,
      className: "border-2 border-primary/20 bg-primary/10",
    },
    {
      label: "Em breve",
      value: emBreve.length,
      icon: <CalendarDays size={18} className="text-green-500" />,
      className: "border-2 border-green-200 bg-green-50",
    },
    {
      label: "Esta semana",
      value: estaSemana.length,
      icon: <Clock size={18} className="text-blue-500" />,
      className: "border-2 border-blue-200 bg-blue-50",
    },
    {
      label: "Categorias",
      value: categoriasUnicas.size,
      icon: <Tag size={18} className="text-yellow-500" />,
      className: "border-2 border-yellow-200 bg-yellow-50",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">

        {/* Header */}
        <header className="px-5 pt-12 pb-5 bg-gray-50">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <img src="/feirinha-logo.svg" alt="Feirinha" width={36} height={36} />
              <span className="text-lg font-bold tracking-tight text-gray-900">Feirinha</span>
            </div>
            <div className="flex items-center gap-1">
              <NotificationBell notificacoes={notificacoes ?? []} />
              <LogoutButton />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Olá, {nome}!
          </h1>
        </header>

        {/* Body */}
        <div className="flex-1 px-5 pb-28 space-y-5">

          {/* Metrics 2×2 */}
          <section className="grid grid-cols-2 gap-3">
            {metrics.map(m => (
              <div key={m.label} className={`rounded-xl p-4 shadow-sm ${m.className ?? ""}`} style={m.style}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-600">{m.label}</span>
                  {m.icon}
                </div>
                <p className="text-4xl font-bold text-gray-900">{m.value}</p>
              </div>
            ))}
          </section>

          {/* Destaques — horizontal scroll snap */}
          {destaques.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-gray-800">Em Destaque</h2>
                <span className="text-xs text-gray-400">deslize →</span>
              </div>
              {/* Bleed to edges */}
              <div className="-mx-5 px-5">
                <div
                  className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
                  style={{ scrollbarWidth: "none" }}
                >
                  {destaques.map(feira => {
                    const dias = diasRestantes(feira.data_inicio)
                    const categorias: string[] = Array.isArray(feira.categorias) ? feira.categorias : []
                    return (
                      <div
                        key={feira.id}
                        className="snap-start shrink-0 w-56 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col border-2 border-gray-200"
                      >
                        <div className="relative">
                          {feira.foto_capa_url ? (
                            <div className="h-24 overflow-hidden">
                              <img
                                src={feira.foto_capa_url}
                                alt={feira.nome}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div
                              className="h-24 flex items-center justify-center bg-gradient-to-br from-primary to-orange-400"
                            >
                              <Store size={26} className="text-white opacity-80" />
                            </div>
                          )}
                          {dias !== null && dias >= 0 && (
                            <span className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              {dias === 0 ? "Hoje!" : `Em ${dias}d`}
                            </span>
                          )}
                        </div>

                        <div className="p-3 flex flex-col gap-1.5 flex-1">
                          <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">
                            {feira.nome}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin size={10} className="shrink-0" />
                            <span className="truncate">{feira.cidade}, {feira.estado}</span>
                          </p>
                          <p className="flex items-center gap-1 text-xs text-gray-500">
                            <CalendarDays size={10} className="shrink-0" />
                            {formatDate(feira.data_inicio)}
                          </p>
                          {categorias.length > 0 && (
                            <span
                              className="self-start text-xs px-1.5 py-0.5 rounded-full capitalize mt-0.5 bg-primary/10 text-primary border border-primary/20"
                            >
                              {categorias[0]}
                            </span>
                          )}
                          <Link
                            href={`/feiras/${feira.id}`}
                            className="mt-auto block text-center py-1.5 rounded-lg text-xs font-semibold text-primary-foreground bg-primary"
                          >
                            Ver detalhes
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Todas as Feiras */}
          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">Todas as Feiras</h2>
            <BuscaFeiras feiras={feiras} />
          </section>

        </div>

        <BottomNav />
      </div>
    </div>
  )
}
