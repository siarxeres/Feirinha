import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { BottomNav } from "../_components/BottomNav"
import { LogoutButton } from "../_components/LogoutButton"
import { CheckCircle2, Clock, AlertTriangle, CreditCard, ChevronRight } from "lucide-react"

function statusAssinatura(status: string) {
  switch (status) {
    case "ativa":
      return {
        label: "Ativa",
        icon: <CheckCircle2 size={15} className="text-green-500 shrink-0" />,
        cls: "text-green-700 bg-green-50",
      }
    case "pendente":
      return {
        label: "Aguardando pagamento",
        icon: <Clock size={15} className="text-yellow-500 shrink-0" />,
        cls: "text-yellow-700 bg-yellow-50",
      }
    case "suspensa":
      return {
        label: "Suspensa",
        icon: <AlertTriangle size={15} className="text-red-500 shrink-0" />,
        cls: "text-red-700 bg-red-50",
      }
    default:
      return {
        label: "Inativa",
        icon: <AlertTriangle size={15} className="text-gray-400 shrink-0" />,
        cls: "text-gray-600 bg-gray-100",
      }
  }
}

export default async function PerfilFeirantePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, assinatura_status, assinatura_expira_em")
    .eq("id", user.id)
    .single()

  const p = profile as any
  const nome            = p?.nome              ?? "—"
  const assinaStatus    = p?.assinatura_status ?? "inativa"
  const expiraEm        = p?.assinatura_expira_em
    ? new Date(p.assinatura_expira_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    : null
  const statusInfo = statusAssinatura(assinaStatus)

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
            <LogoutButton />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        </header>

        <div className="flex-1 px-5 pb-28 space-y-4">

          {/* Dados do perfil */}
          <div
            className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100"
            style={{ border: "2px solid #e5e7eb" }}
          >
            <div className="px-5 py-4">
              <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Nome</label>
              <p className="mt-1 font-medium text-gray-900">{nome}</p>
            </div>
            <div className="px-5 py-4">
              <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">E-mail</label>
              <p className="mt-1 font-medium text-gray-900">{user.email}</p>
            </div>
          </div>

          {/* Assinatura */}
          <Link
            href="/dashboard/feirante/assinatura"
            className="block bg-white rounded-2xl shadow-sm"
            style={{ border: "2px solid #e5e7eb" }}
          >
            <div className="px-5 py-4 flex items-center gap-3">
              <CreditCard size={18} style={{ color: "#E8560A" }} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">Assinatura</p>
                <div className={`inline-flex items-center gap-1.5 mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.cls}`}>
                  {statusInfo.icon}
                  {statusInfo.label}
                  {assinaStatus === "ativa" && expiraEm && (
                    <span className="text-green-600 font-normal">· até {expiraEm}</span>
                  )}
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 shrink-0" />
            </div>
          </Link>

          {/* Sair */}
          <div
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
            style={{ border: "2px solid #e5e7eb" }}
          >
            <LogoutButton variant="full" />
          </div>

        </div>

        <BottomNav />
      </div>
    </div>
  )
}
