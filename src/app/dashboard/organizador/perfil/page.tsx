import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { User, Mail, Shield } from "lucide-react"
import { BottomNav } from "../_components/BottomNav"

export default async function PerfilOrganizadorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, email, roles")
    .eq("id", user.id)
    .single()

  const nome = profile?.nome || user.user_metadata?.nome || "Usuário"
  const email = profile?.email || user.email || ""
  const initials = nome.split(" ").filter(Boolean).slice(0, 2).map((w: string) => w[0].toUpperCase()).join("")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">

        <header className="px-5 pt-12 pb-5">
          <div className="flex items-center gap-2 mb-5">
            <img src="/feirinha-logo.svg" alt="Feirinha" width={36} height={36} />
            <span className="text-lg font-bold tracking-tight text-gray-900">Feirinha</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
        </header>

        <div className="flex-1 px-5 pb-28 space-y-4">

          {/* Avatar */}
          <div className="flex flex-col items-center py-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold mb-3 bg-primary"
            >
              {initials}
            </div>
            <p className="text-lg font-bold text-gray-900">{nome}</p>
            <span className="text-xs px-3 py-1 rounded-full mt-1 font-medium bg-orange-100 text-orange-700">
              Organizador
            </span>
          </div>

          {/* Dados */}
          <div className="rounded-2xl bg-white shadow-sm overflow-hidden" style={{ border: "2px solid #e5e7eb" }}>
            <div className="px-4 pt-4 pb-1">
              <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Informações</h2>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                  <User size={16} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nome</p>
                  <p className="text-sm font-semibold text-gray-900">{nome}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">E-mail</p>
                  <p className="text-sm font-semibold text-gray-900">{email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                  <Shield size={16} className="text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Papel</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">Organizador</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <BottomNav />
      </div>
    </div>
  )
}
