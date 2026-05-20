import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { LogOut, CalendarDays, MapPin, Store, Flame } from "lucide-react"
import Link from "next/link"
import { BuscaFeiras } from "./BuscaFeiras"

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
  const diff = Math.ceil(
    (new Date(dataInicio + "T00:00:00").getTime() - Date.now()) / 86_400_000
  )
  return diff
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

  const nome = profile?.nome || user.user_metadata?.nome || user.email || "visitante"
  const feiras = todasFeiras ?? []

  // 3 feiras mais próximas por data (a partir de hoje)
  const hoje = new Date().toISOString().slice(0, 10)
  const emBreve = feiras
    .filter(f => f.data_inicio && f.data_inicio >= hoje)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/feirinha-logo.svg" alt="Feirinha" width={36} height={36} />
            <p className="text-xl font-bold text-gray-900">
              Olá, <span className="text-[#E8560A]">{nome}</span>!
            </p>
          </div>
          <a
            href="/auth/logout"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
          >
            <LogOut size={16} />
            Sair
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">

        {/* Destaques */}
        {emBreve.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Flame size={18} className="text-[#E8560A]" />
              <h2 className="text-lg font-semibold text-gray-900">Feiras em destaque</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {emBreve.map(feira => {
                const dias = diasRestantes(feira.data_inicio)
                const categorias: string[] = Array.isArray(feira.categorias) ? feira.categorias : []

                return (
                  <div
                    key={feira.id}
                    className="relative bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                  >
                    {feira.foto_capa_url ? (
                      <div className="h-32 overflow-hidden">
                        <img
                          src={feira.foto_capa_url}
                          alt={feira.nome}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-32 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                        <Store size={36} className="text-[#E8560A] opacity-30" />
                      </div>
                    )}

                    {dias !== null && dias >= 0 && (
                      <span className="absolute top-2 right-2 bg-[#E8560A] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {dias === 0 ? 'Hoje!' : `Em ${dias}d`}
                      </span>
                    )}

                    <div className="p-4 flex flex-col flex-1 gap-2">
                      <p className="font-semibold text-gray-900 line-clamp-1">{feira.nome}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={11} /> {feira.cidade}, {feira.estado}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <CalendarDays size={11} />
                        {formatDate(feira.data_inicio)} – {formatDate(feira.data_fim)}
                      </p>
                      {categorias.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {categorias.slice(0, 2).map(cat => (
                            <span
                              key={cat}
                              className="text-xs px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded-full border border-orange-100 capitalize"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                      <Link
                        href={`/feiras/${feira.id}`}
                        className="mt-auto block text-center py-1.5 rounded-xl text-xs font-semibold bg-[#E8560A] text-white hover:bg-[#C4450A] transition-colors"
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

        {/* Todas as feiras com busca */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Todas as Feiras</h2>
          <BuscaFeiras feiras={feiras} />
        </section>

      </div>
    </div>
  )
}
