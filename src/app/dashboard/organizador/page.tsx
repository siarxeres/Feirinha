import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Bell, ClipboardList, CheckCircle2, DollarSign, Clock } from "lucide-react"
import { BottomNav } from "./_components/BottomNav"
import { InscricoesAguardando } from "./_components/InscricoesAguardando"

const PREVIEW_LIMIT = 5

export default async function OrganizadorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome")
    .eq("id", user.id)
    .single() as unknown as { data: { nome: string | null } | null }

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
      bg: "bg-orange-50",
    },
    {
      label: "Aprovadas",
      value: String(aprovadosCount),
      icon: <CheckCircle2 size={18} className="text-green-500" />,
      bg: "bg-green-50",
    },
    {
      label: "Receita (R$)",
      value: "0,00",
      icon: <DollarSign size={18} className="text-blue-500" />,
      bg: "bg-blue-50",
    },
    {
      label: "Pendentes",
      value: String(pendentesCount),
      icon: <Clock size={18} className="text-yellow-500" />,
      bg: "bg-yellow-50",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-sm flex flex-col">

        {/* Header */}
        <header className="px-5 pt-12 pb-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <img src="/feirinha-logo.svg" alt="Feirinha" width={30} height={30} />
              <span className="text-[15px] font-extrabold tracking-tight text-gray-900">
                Feirinhas
              </span>
            </div>
            <button
              aria-label="Notificações"
              className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <Bell size={21} className="text-gray-700" />
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {userName}
          </h1>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 px-5 pb-28 space-y-5">

          {/* 2×2 metrics */}
          <section className="grid grid-cols-2 gap-3">
            {metrics.map(m => (
              <div key={m.label} className={`rounded-2xl p-4 ${m.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">{m.label}</span>
                  {m.icon}
                </div>
                <p className="text-2xl font-bold text-gray-900">{m.value}</p>
              </div>
            ))}
          </section>

          {/* Inscricoes aguardando */}
          <section className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white">
            <div className="px-4 pt-4 pb-1">
              <h2 className="text-[15px] font-semibold text-gray-900">
                Aguardando aprovação
              </h2>
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
