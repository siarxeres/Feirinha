import type { ReactNode, CSSProperties } from "react"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ClipboardList, CheckCircle2, Clock, Store, MapPin, CalendarDays } from "lucide-react"
import { BottomNav } from "./_components/BottomNav"
import { LogoutButton } from "./_components/LogoutButton"
import { NotificationBell } from "@/components/NotificationBell"
import { dataDeHojeISO } from "@/lib/feira-status"
import { EmptyState } from "@/components/EmptyState"

const NOTIFICACOES_LIMIT = 20

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  return new Date(value + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  })
}

export default async function FeirantePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  // Admin client bypassa RLS — garante leitura correta de roles
  const admin = createAdminClient()
  const [{ data: profile }, { data: inscricoes }, { data: feirasPublicadas }, { data: notificacoes }] = await Promise.all([
    admin
      .from("profiles")
      .select("nome, roles")
      .eq("id", user.id)
      .maybeSingle(),

    // Admin client bypassa RLS — a policy de "feiras" só libera SELECT pra
    // não-dono quando status = "publicada", então o embed vinha null pra
    // feiras encerradas. Autorização garantida por .eq("feirante_id", ...).
    admin
      .from("inscricoes")
      .select("id, status, created_at, feira_id, feiras(id, nome, cidade, estado, data_inicio, data_fim)")
      .eq("feirante_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("feiras")
      .select("id, nome, cidade, estado, data_inicio, data_fim, capacidade_barracas, taxa_inscricao, taxa_barraca, categorias")
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

  const p = profile as any
  const nome = p?.nome || user.user_metadata?.nome || user.email || "Feirante"
  // Usa apenas o banco — nunca user_metadata que pode estar estagnado
  const rawRoles = p?.roles
  let roles: string[] = []
  if (Array.isArray(rawRoles)) {
    roles = rawRoles
  } else if (typeof rawRoles === 'string') {
    roles = rawRoles
      .replace(/^\{|\}$/g, '')
      .split(',')
      .map(r => r.trim().replace(/^"|"$/g, ''))
      .filter(Boolean)
  }

  // Guard: não-feirante não tem acesso a esta área
  if (!roles.includes("feirante")) redirect("/dashboard")

  const lista = (inscricoes ?? []) as any[]
  const feiras = (feirasPublicadas ?? []) as any[]

  const totalInscricoes = lista.length
  const aprovadas = lista.filter((i: any) => i.status === "aprovada").length
  const pendentes = lista.filter((i: any) => i.status === "pendente").length
  const inscritasIds = new Set(lista.map((i: any) => i.feira_id).filter(Boolean))

  const metrics: {
    label: string
    value: number
    icon: ReactNode
    className?: string
    style?: CSSProperties
  }[] = [
    {
      label: "Inscrições",
      value: totalInscricoes,
      icon: <ClipboardList size={18} className="text-orange-500" />,
      className: "border-2 border-primary/20 bg-primary/10",
    },
    {
      label: "Aprovadas",
      value: aprovadas,
      icon: <CheckCircle2 size={18} className="text-green-500" />,
      style: { border: "2px solid #bbf7d0", backgroundColor: "#f0fdf4" },
    },
    {
      label: "Pendentes",
      value: pendentes,
      icon: <Clock size={18} className="text-yellow-500" />,
      style: { border: "2px solid #fef08a", backgroundColor: "#fefce8" },
    },
    {
      label: "Disponíveis",
      value: feiras.length,
      icon: <Store size={18} className="text-blue-500" />,
      style: { border: "2px solid #bfdbfe", backgroundColor: "#eff6ff" },
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

        {/* Scrollable body */}
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

          {/* Feiras Disponíveis */}
          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">Feiras Disponíveis</h2>

            {feiras.length === 0 ? (
              <EmptyState
                icon={Store}
                title="Nenhuma feira publicada no momento"
                description="Assim que um organizador publicar uma feira, ela aparece aqui."
                card
              />
            ) : (
              <div className="space-y-3">
                {feiras.map((feira: any) => {
                  const jaInscrito = inscritasIds.has(feira.id)
                  const categorias: string[] = Array.isArray(feira.categorias) ? feira.categorias : []

                  return (
                    <div
                      key={feira.id}
                      className="rounded-2xl bg-white shadow-sm overflow-hidden border-2 border-gray-200"
                    >
                      <div
                        className="h-16 flex items-center justify-center bg-gradient-to-br from-primary to-orange-400"
                      >
                        <Store size={28} className="text-white opacity-80" />
                      </div>

                      <div className="px-4 pt-3 pb-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p className="text-sm font-bold text-gray-900 leading-snug">{feira.nome}</p>
                          {jaInscrito ? (
                            <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700 shrink-0">
                              Inscrito
                            </span>
                          ) : (
                            <Link
                              href={`/feiras/${feira.id}/inscricao`}
                              className="text-xs px-3 py-1.5 rounded-full font-semibold text-primary-foreground shrink-0 transition-colors bg-primary hover:bg-primary/80"
                            >
                              Me inscrever
                            </Link>
                          )}
                        </div>

                        <div className="flex flex-col gap-1 mb-2">
                          <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <MapPin size={12} />
                            {feira.cidade}, {feira.estado}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <CalendarDays size={12} />
                            {formatDate(feira.data_inicio)} – {formatDate(feira.data_fim)}
                          </span>
                          {feira.capacidade_barracas && (
                            <span className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Store size={12} />
                              {feira.capacidade_barracas} barracas
                            </span>
                          )}
                        </div>

                        {categorias.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {categorias.map((cat: string) => (
                              <span
                                key={cat}
                                className="text-xs px-2 py-0.5 rounded-full capitalize bg-primary/10 text-primary border border-primary/20"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}

                        {(feira.taxa_inscricao > 0 || feira.taxa_barraca > 0) && (
                          <p className="text-xs text-gray-400 mt-2">
                            {feira.taxa_inscricao > 0 && `Inscrição: R$ ${Number(feira.taxa_inscricao).toFixed(2)}`}
                            {feira.taxa_inscricao > 0 && feira.taxa_barraca > 0 && " · "}
                            {feira.taxa_barraca > 0 && `Taxa do App: R$ ${Number(feira.taxa_barraca).toFixed(2)}`}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

        </div>

        <BottomNav />
      </div>
    </div>
  )
}
