import { createClient, createAdminClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Bell, ClipboardList, CheckCircle2, Clock, Store, MapPin, CalendarDays, AlertTriangle, XCircle } from "lucide-react"
import { BottomNav } from "./_components/BottomNav"
import { LogoutButton } from "./_components/LogoutButton"

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  return new Date(value + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  })
}

const AVATAR_COLORS = [
  "bg-purple-500", "bg-blue-500", "bg-green-500",
  "bg-pink-500", "bg-yellow-500", "bg-indigo-500", "bg-teal-500",
]

function initials(name: string | null | undefined) {
  if (!name) return "?"
  return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("")
}

function avatarBg(name: string | null | undefined, id: string) {
  const seed = (name?.charCodeAt(0) ?? 0) + (id.charCodeAt(0) ?? 0)
  return AVATAR_COLORS[seed % AVATAR_COLORS.length]
}

function statusBadge(status: string) {
  if (status === "aprovada")     return { label: "Aprovada",        cls: "bg-green-100 text-green-700" }
  if (status === "pendente")     return { label: "Pendente",        cls: "bg-yellow-100 text-yellow-700" }
  if (status === "rejeitada")    return { label: "Rejeitada",       cls: "bg-red-100 text-red-700" }
  if (status === "lista_espera") return { label: "Lista de espera", cls: "bg-gray-100 text-gray-600" }
  return { label: status, cls: "bg-gray-100 text-gray-600" }
}

export default async function FeirantePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  // Admin client bypassa RLS — garante leitura correta de roles
  const admin = createAdminClient()
  const [{ data: profile }, { data: inscricoes }, { data: feirasPublicadas }] = await Promise.all([
    admin
      .from("profiles")
      .select("nome, assinatura_status, aprovacao_status, roles")
      .eq("id", user.id)
      .maybeSingle(),

    supabase
      .from("inscricoes")
      .select("id, status, created_at, feira_id, feiras(id, nome, cidade, estado, data_inicio, data_fim)")
      .eq("feirante_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("feiras")
      .select("id, nome, cidade, estado, data_inicio, data_fim, capacidade_barracas, taxa_inscricao, taxa_barraca, categorias")
      .eq("status", "publicada")
      .order("data_inicio", { ascending: true }),
  ])

  const p = profile as any
  const nome = p?.nome || user.user_metadata?.nome || user.email || "Feirante"
  const aprovacaoStatus = p?.aprovacao_status ?? null
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
  const assinaturaAtiva = p?.assinatura_status === "ativa"

  // Guard: não-feirante não tem acesso a esta área
  if (!roles.includes("feirante")) redirect("/dashboard")

  if (!aprovacaoStatus || aprovacaoStatus === "pendente") {
    redirect("/dashboard/feirante/onboarding")
  }
  const lista = (inscricoes ?? []) as any[]
  const feiras = (feirasPublicadas ?? []) as any[]

  const totalInscricoes = lista.length
  const aprovadas = lista.filter((i: any) => i.status === "aprovada").length
  const pendentes = lista.filter((i: any) => i.status === "pendente").length
  const inscritasIds = new Set(lista.map((i: any) => i.feira_id).filter(Boolean))

  const metrics = [
    {
      label: "Inscrições",
      value: totalInscricoes,
      icon: <ClipboardList size={18} className="text-orange-500" />,
      style: { border: "2px solid #fed7aa", backgroundColor: "#fff7ed" },
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

  // Aguardando aprovação do admin
  if (aprovacaoStatus === "aguardando_aprovacao") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto min-h-screen flex flex-col">
          <header className="px-5 pt-12 pb-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <img src="/feirinha-logo.svg" alt="Feirinha" width={36} height={36} />
                <span className="text-lg font-bold tracking-tight text-gray-900">Feirinha</span>
              </div>
              <LogoutButton />
            </div>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center px-5 pb-16 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: "#fff7ed" }}
            >
              <Clock size={36} style={{ color: "#E8560A" }} />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">Em análise</h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mb-8">
              Olá, {nome}! Recebemos seu cadastro e estamos analisando. Você terá acesso completo assim que nossa equipe aprovar sua conta.
            </p>

            {/* Timeline */}
            <div className="w-full max-w-xs bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Etapas</p>
              <div className="space-y-4">
                {[
                  { label: "Cadastro realizado", done: true },
                  { label: "Pagamento enviado", done: true },
                  { label: "Análise da conta", done: false, active: true },
                  { label: "Acesso liberado", done: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={
                        item.done
                          ? { backgroundColor: "#1D9E75" }
                          : item.active
                          ? { backgroundColor: "#E8560A" }
                          : { backgroundColor: "#e5e7eb" }
                      }
                    >
                      {item.done ? (
                        <CheckCircle2 size={14} className="text-white" />
                      ) : (
                        <div className={`w-2 h-2 rounded-full ${item.active ? "bg-white" : "bg-gray-400"}`} />
                      )}
                    </div>
                    <span className={`text-sm ${item.done ? "text-gray-700 font-medium" : item.active ? "text-[#E8560A] font-semibold" : "text-gray-400"}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Dúvidas? Entre em contato pelo e-mail{" "}
              <a href="mailto:suporte@feirinhas.app" className="text-[#1D9E75] font-medium">
                suporte@feirinhas.app
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Cadastro rejeitado
  if (aprovacaoStatus === "rejeitado") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto min-h-screen flex flex-col">
          <header className="px-5 pt-12 pb-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <img src="/feirinha-logo.svg" alt="Feirinha" width={36} height={36} />
                <span className="text-lg font-bold tracking-tight text-gray-900">Feirinha</span>
              </div>
              <LogoutButton />
            </div>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center px-5 pb-16 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: "#fef2f2" }}
            >
              <XCircle size={36} className="text-red-500" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">Cadastro não aprovado</h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mb-8">
              Olá, {nome}. Infelizmente seu cadastro não foi aprovado. Entre em contato com nossa equipe para mais informações.
            </p>

            <a
              href="mailto:suporte@feirinhas.app"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: "#E8560A" }}
            >
              Falar com o suporte
            </a>
          </div>
        </div>
      </div>
    )
  }

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

          {/* Subscription banner */}
          {!assinaturaAtiva && (
            <section
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: "#fffbeb", border: "2px solid #fde68a" }}
            >
              <AlertTriangle size={18} className="text-yellow-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-yellow-800">Assinatura inativa</p>
                <p className="text-xs text-yellow-700 mt-0.5">Ative para se inscrever em feiras.</p>
              </div>
              <Link
                href="/dashboard/feirante/assinatura"
                className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                style={{ backgroundColor: "#E8560A" }}
              >
                Assinar
              </Link>
            </section>
          )}

          {/* Metrics 2×2 */}
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

          {/* Minhas Inscrições */}
          <section
            className="rounded-2xl shadow-sm overflow-hidden"
            style={{ border: "2px solid #e9d5ff", backgroundColor: "#faf5ff" }}
          >
            <div className="px-4 pt-4 pb-1">
              <h2 className="text-base font-bold text-gray-800">Minhas Inscrições</h2>
            </div>
            <div className="px-4 pb-4">
              {lista.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">
                  Você ainda não se inscreveu em nenhuma feira
                </p>
              ) : (
                <div className="divide-y divide-purple-100">
                  {lista.map((insc: any) => {
                    const feiraData = Array.isArray(insc.feiras) ? insc.feiras[0] : insc.feiras
                    const nomeFeira = feiraData?.nome ?? "Feira"
                    const badge = statusBadge(insc.status)
                    return (
                      <div key={insc.id} className="flex items-center gap-3 py-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${avatarBg(nomeFeira, insc.id)}`}
                        >
                          {initials(nomeFeira)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{nomeFeira}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {feiraData?.cidade ?? "—"}
                            {feiraData?.data_inicio ? ` · ${formatDate(feiraData.data_inicio)}` : ""}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Feiras Disponíveis */}
          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">Feiras Disponíveis</h2>

            {feiras.length === 0 ? (
              <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-8 text-center">
                <p className="text-sm text-gray-400">Nenhuma feira publicada no momento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {feiras.map((feira: any) => {
                  const jaInscrito = inscritasIds.has(feira.id)
                  const categorias: string[] = Array.isArray(feira.categorias) ? feira.categorias : []

                  return (
                    <div
                      key={feira.id}
                      className="rounded-2xl bg-white shadow-sm overflow-hidden"
                      style={{ border: "2px solid #e5e7eb" }}
                    >
                      <div
                        className="h-16 flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #E8560A 0%, #f97316 100%)" }}
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
                          ) : assinaturaAtiva ? (
                            <Link
                              href={`/feiras/${feira.id}/inscricao`}
                              className="text-xs px-3 py-1.5 rounded-full font-semibold text-white shrink-0 transition-colors"
                              style={{ backgroundColor: "#E8560A" }}
                            >
                              Me inscrever
                            </Link>
                          ) : (
                            <Link
                              href="/dashboard/feirante/assinatura"
                              className="text-xs px-3 py-1.5 rounded-full font-semibold shrink-0 bg-gray-100 text-gray-500"
                            >
                              Assinar
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
                                className="text-xs px-2 py-0.5 rounded-full capitalize"
                                style={{ backgroundColor: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" }}
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
                            {feira.taxa_barraca > 0 && `Barraca: R$ ${Number(feira.taxa_barraca).toFixed(2)}`}
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
