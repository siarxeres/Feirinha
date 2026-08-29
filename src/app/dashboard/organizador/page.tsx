import { createClient, createAdminClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Bell, ClipboardList, CheckCircle2, DollarSign, Clock, LogOut, Store, User } from "lucide-react"
import { BottomNav } from "./_components/BottomNav"
import { InscricoesAguardando } from "./_components/InscricoesAguardando"
import { dataDeHojeISO } from "@/lib/feira-status"
import { autoEncerrarFeirasVencidas } from "@/lib/auto-encerrar-feiras"

const PREVIEW_LIMIT = 5

function countOrLog(label: string, query: PromiseLike<{ count: number | null; error: { message: string } | null }>) {
  return query.then(r => {
    if (r.error) console.error(`Erro ao contar ${label}:`, r.error)
    return Number(r.count ?? 0)
  })
}

async function logout() {
  "use server"
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}

export default async function OrganizadorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  // Admin client bypassa RLS — garante leitura correta de roles
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from("profiles")
    .select("nome, roles")
    .eq("id", user.id)
    .maybeSingle() as unknown as { data: { nome: string | null; roles: unknown } | null }

  const rawRoles = profile?.roles
  let profileRoles: string[] = []
  if (Array.isArray(rawRoles)) {
    profileRoles = rawRoles
  } else if (typeof rawRoles === 'string') {
    profileRoles = rawRoles
      .replace(/^\{|\}$/g, '')
      .split(',')
      .map(r => r.trim().replace(/^"|"$/g, ''))
      .filter(Boolean)
  }

  // Guard: não-organizador não tem acesso a esta área
  if (!profileRoles.includes("organizador")) redirect("/dashboard")

  await autoEncerrarFeirasVencidas(supabase, user.id)

  const { data: feiras } = await supabase
    .from("feiras")
    .select("id")
    .eq("organizador_id", user.id)
    .eq("status", "publicada")
    .gte("data_fim", dataDeHojeISO())

  const feiraIds = (feiras ?? []).map((f: any) => f.id).filter(Boolean)

  const [totalCount, aprovadosCount, pendentesCount, inscricoesPendentes] =
    await Promise.all([
      feiraIds.length
        ? countOrLog(
            "inscrições",
            supabase
              .from("inscricoes")
              .select("id", { count: "exact", head: true })
              .in("feira_id", feiraIds)
          )
        : Promise.resolve(0),

      feiraIds.length
        ? countOrLog(
            "aprovadas",
            supabase
              .from("inscricoes")
              .select("id", { count: "exact", head: true })
              .in("feira_id", feiraIds)
              .eq("status", "aprovada")
          )
        : Promise.resolve(0),

      feiraIds.length
        ? countOrLog(
            "pendentes",
            supabase
              .from("inscricoes")
              .select("id", { count: "exact", head: true })
              .in("feira_id", feiraIds)
              .eq("status", "pendente")
          )
        : Promise.resolve(0),

      feiraIds.length
        ? supabase
            .from("inscricoes")
            .select("id, status, feira_id, profiles(nome), feiras(nome)")
            .in("feira_id", feiraIds)
            .eq("status", "pendente")
            .order("created_at", { ascending: true })
            .limit(PREVIEW_LIMIT)
            .then(r => {
              if (r.error) console.error("Erro ao buscar inscrições pendentes:", r.error)
              return r.data ?? []
            })
        : Promise.resolve([]),
    ])

  const userName = profile?.nome || user.user_metadata?.nome || user.email || "Usuário"
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite"

  const metrics = [
    {
      label: "Inscrições",
      value: String(totalCount),
      icon: <ClipboardList size={18} className="text-orange-500" />,
      borderStyle: { border: '1px solid #fed7aa', backgroundColor: '#ffffff' } as React.CSSProperties,
    },
    {
      label: "Aprovadas",
      value: String(aprovadosCount),
      icon: <CheckCircle2 size={18} className="text-green-500" />,
      borderStyle: { border: '1px solid #bbf7d0', backgroundColor: '#ffffff' } as React.CSSProperties,
    },
    {
      label: "Receita (R$)",
      value: "0,00",
      icon: <DollarSign size={18} className="text-blue-500" />,
      borderStyle: { border: '1px solid #bfdbfe', backgroundColor: '#ffffff' } as React.CSSProperties,
    },
    {
      label: "Pendentes",
      value: String(pendentesCount),
      icon: <Clock size={18} className="text-yellow-500" />,
      borderStyle: { border: '1px solid #fef08a', backgroundColor: '#ffffff' } as React.CSSProperties,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 shadow-sm flex flex-col">

        <header className="px-5 pt-12 pb-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <img src="/feirinha-logo.svg" alt="Feirinha" width={36} height={36} />
              <span className="text-lg font-bold tracking-tight text-gray-900">Feirinha</span>
            </div>
            <div className="flex items-center gap-1">
              <button aria-label="Notificações" className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
                <Bell size={21} className="text-gray-700" />
              </button>
              <Link
                href="/dashboard/organizador/perfil"
                aria-label="Meu perfil"
                className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <User size={21} className="text-gray-700" />
              </Link>
              <form action={logout}>
                <button type="submit" aria-label="Sair" className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
                  <LogOut size={21} className="text-gray-700" />
                </button>
              </form>
            </div>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>
            {greeting}, {userName}
          </h1>
        </header>

        <div className="flex-1 px-5 pb-28 space-y-5">
          <section className="grid grid-cols-2 gap-3">
            {metrics.map(m => (
              <div key={m.label} className="rounded-xl p-4 shadow-sm bg-white" style={m.borderStyle}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-600">{m.label}</span>
                  {m.icon}
                </div>
                <p className="text-4xl font-bold text-gray-900">{m.value}</p>
              </div>
            ))}
          </section>

          <Link
            href="/dashboard/organizador/feiras"
            className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
            style={{ border: '2px solid #E8560A', color: '#E8560A' }}
          >
            <Store size={18} />
            Ver minhas feiras
          </Link>

          {pendentesCount > 0 && (
            <section className="rounded-2xl shadow-sm overflow-hidden" style={{ border: '2px solid #c4b5fd', backgroundColor: '#f5f3ff' }}>
              <div className="px-4 pt-4 pb-1">
                <h2 className="text-base font-bold text-gray-800">Aguardando aprovação</h2>
              </div>
              <div className="px-4 pb-4">
                <InscricoesAguardando
                  inscricoes={inscricoesPendentes as any}
                  totalPendentes={pendentesCount}
                />
              </div>
            </section>
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  )
}