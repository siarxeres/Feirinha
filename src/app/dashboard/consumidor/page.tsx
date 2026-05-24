import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { Bell, Store, CalendarDays, Clock, Tag, MapPin, Flame } from "lucide-react"
import Link from "next/link"
import { BuscaFeiras } from "./BuscaFeiras"
import { BottomNav } from "./_components/BottomNav"
import { LogoutButton } from "./_components/LogoutButton"

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  return new Date(value + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const [{ data: profile }, { data: todasFeiras }] = await Promise.all([
    supabase
      .from("profiles")
      .select("nome")
      .eq("id", user.id)
      .single(),

    adminClient
      .from("feiras")
      .select("id, nome, cidade, estado, data_inicio, data_fim, capacidade_barracas, foto_capa_url, categorias")
      .eq("status", "publicada")
      .order("data_inicio", { ascending: true }),
  ])

  const nome = (profile as any)?.nome || user.user_metadata?.nome || user.email || "visitante"
  const feiras = todasFeiras ?? []

  const hoje = new Date().toISOString().slice(0, 10)
  const seteDias = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10)

  const emBreve = feiras.filter(f => f.data_inicio && f.data_inicio >= hoje)
  const estaSemana = feiras.filter(f => f.data_inicio && f.data_inicio >= hoje && f.data_inicio <= seteDias)
  const categoriasUnicas = new Set(feiras.flatMap(f => Array.isArray(f.categorias) ? f.categorias : []))

  const destaques = emBreve.slice(0, 3)

  const metrics = [
    {
      label: "Feiras",
      value: feiras.length,
      icon: <Store size={18} className="text-orange-500" />,
      style: { border: "2px solid #fed7aa", backgroundColor: "#fff7ed" },
    },
    {
      label: "Em breve",
      value: emBreve.length,
      icon: <CalendarDays size={18} className="text-green-500" />,
      style: { border: "2px solid #bbf7d0", backgroundColor: "#f0fdf4" },
    },
    {
      label: "Esta semana",
      value: estaSemana.length,
      icon: <Clock size={18} className="text-blue-500" />,
      style: { border: "2px solid #bfdbfe", backgroundColor: "#eff6ff" },
    },
    {
      label: "Categorias",
      value: categoriasUnicas.size,
      icon: <Tag size={18} className="text-yellow-500" />,
      style: { border: "2px solid #fef08a", backgroundColor: "#fefce8" },
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
              <span className="text-lg font-bold tracking-tight text-gray-900">Feirinhas</span>
            </div>
            <div className="flex items-center gap-1">
              <button aria-label="Notificações" className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
                <Bell size={21} className="text-gray-700" />
              </button>
              <LogoutButton />
            </div>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "#1A1A1A" }}>
            Olá, {nome}!
          </h1>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 px-5 pb-28 space-y-5">

          {/* Métricas 2×2 */}
          <section className="grid grid-cols-2 gap-3">
            {metrics.map(m => (
              <div key={m.label} className="rounded-xl p-4 shadow-sm" style={m.style}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-600">{m.label}</span>
                  {m.icon}
                </div>
                <p className="text-4xl font-bold text-gray-900">{m.value}</p>
              </div>
            ))}
          </section>

          {/* Destaques */}
          {destaques.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Flame size={18} className="text-[#E8560A]" />
                <h2 className="text-base font-bold text-gray-800">Destaques</h2>
              </div>

              <div className="space-y-3">
                {destaques.map(feira => {
                  const dias = diasRestantes(feira.data_inicio)
                  const categorias: string[] = Array.isArray(feira.categorias) ? feira.categorias : []

                  return (
                    <div
                      key={feira.id}
                      className="relative rounded-2xl bg-white shadow-sm overflow-hidden"
                      style={{ border: "2px solid #e5e7eb" }}
                    >
                      {feira.foto_capa_url ? (
                        <div className="h-28 overflow-hidden">
                          <img
                            src={feira.foto_capa_url}
                            alt={feira.nome}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className="h-28 flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, #E8560A 0%, #f97316 100%)" }}
                        >
                          <Store size={32} className="text-white opacity-80" />
                        </div>
                      )}

                      {dias !== null && dias >= 0 && (
                        <span className="absolute top-2 right-2 bg-[#E8560A] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {dias === 0 ? "Hoje!" : `Em ${dias}d`}
                        </span>
                      )}

                      <div className="px-4 pt-3 pb-4 flex flex-col gap-2">
                        <p className="text-sm font-bold text-gray-900 leading-snug">{feira.nome}</p>
                        <p className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin size={12} /> {feira.cidade}, {feira.estado}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-gray-500">
                          <CalendarDays size={12} />
                          {formatDate(feira.data_inicio)} – {formatDate(feira.data_fim)}
                        </p>
                        {categorias.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {categorias.slice(0, 2).map(cat => (
                              <span
                                key={cat}
                                className="text-xs px-2 py-0.5 rounded-full capitalize"
                                style={{ backgroundColor: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" }}
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}
                        <Link
                          href={`/feiras/${feira.id}`}
                          className="mt-1 block text-center py-1.5 rounded-xl text-xs font-semibold text-white transition-colors"
                          style={{ backgroundColor: "#E8560A" }}
                        >
                          Ver detalhes
                        </Link>
                      </div>
                    </div>
                  )
                })}
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
