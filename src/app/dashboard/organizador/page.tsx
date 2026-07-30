import { createClient, createAdminClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Bell, ClipboardList, CheckCircle2, DollarSign, Clock, LogOut, Plus, Store } from "lucide-react"
import { BottomNav } from "./_components/BottomNav"
import { InscricoesAguardando } from "./_components/InscricoesAguardando"

const PREVIEW_LIMIT = 5

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

  const { data: feiras } = await supabase
    .from("feiras")
    .select("id")
    .eq("organizador_id", user.id)

  const feiraIds = (feiras ?? []).map((f: any) => f.id).filter(Boolean)

  const [totalCount, aprovadosCount, pendentesCount, inscricoesPendentes] =
    await Promise.all([
      feiraIds.length
        ? supabase
            .from("inscricoes")
            .select("id", { count: "exact", head: true })
            .in("feira_id", feiraIds)
            .then(r => Number(r.count ?? 0))
        : Promise.resolve(0),

      feiraIds.length
        ? supabase
            .from("inscricoes")
            .select("id", { count: "exact", head: true })
            .in("feira_id", feiraIds)
            .in("status", ["aprovado", "aprovada"])
            .then(r => Number(r.count ?? 0))
        : Promise.resolve(0),

      feiraIds.length
        ? supabase
            .from("inscricoes")
            .select("id", { count: "exact", head: true })
            .in("feira_id", feiraIds)
            .eq("status", "pendente")
            .then(r => Number(r.count ?? 0))
        : Promise.resolve(0),

      feiraIds.length
        ? supabase
            .from("inscricoes")
            .select("id, status, categoria, subcategoria, profiles(nome)")
            .in("feira_id", feiraIds)
            .eq("status", "pendente")
            .order("created_at", { ascending: true })
            .limit(PREVIEW_LIMIT)
            .then(r => r.data ?? [])
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
              <form action={logout}>
                <button type="submit" aria-label="Sair" className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
                  <LogOut size={21} className="text-gray-700" />
                </button>
              </form>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            {greeting}, {userName}
          </h1>
          <Link
            href="/feiras/nova"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold text-white shadow-md transition-all active:scale-[0.98]"
            style={{ backgroundColor: '#E8560A' }}
          >
            <Plus size={18} />
            Criar feira
          </Link>
          <Link
            href="/dashboard/organizador/feiras"
            className="flex items-center justify-center gap-2 w-full py-3 mt-2 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
            style={{ border: '2px solid #E8560A', color: '#E8560A' }}
          >
            <Store size={18} />
            Minhas feiras
          </Link>
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
        </div>

        <BottomNav />
      </div>
    </div>
  )
}