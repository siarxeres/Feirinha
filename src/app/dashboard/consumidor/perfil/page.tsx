import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BottomNav } from "../_components/BottomNav"
import { LogoutButton } from "../_components/LogoutButton"
import { EditProfileForm } from "./EditProfileForm"
import { User, Mail } from "lucide-react"

function getInitials(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("")
}

function avatarColor(nome: string): string {
  const colors = [
    "#E8560A", "#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b",
    "#ef4444", "#ec4899", "#06b6d4",
  ]
  let hash = 0
  for (const ch of nome) hash = (hash * 31 + ch.charCodeAt(0)) % colors.length
  return colors[Math.abs(hash)]
}

export default async function PerfilConsumidorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome")
    .eq("id", user.id)
    .single()

  const nome = (profile as any)?.nome || user.user_metadata?.nome || user.email?.split("@")[0] || "Usuário"
  const email = user.email ?? "—"
  const initials = getInitials(nome)
  const color = avatarColor(nome)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">

        {/* Header */}
        <header className="px-5 pt-12 pb-5 bg-gray-50">
          <div className="flex items-center gap-2 mb-5">
            <img src="/feirinha-logo.svg" alt="Feirinha" width={36} height={36} />
            <span className="text-lg font-bold tracking-tight text-gray-900">Feirinha</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        </header>

        <div className="flex-1 px-5 pb-28 space-y-4">

          {/* Avatar + name */}
          <div className="flex flex-col items-center py-6 gap-3">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white select-none"
              style={{ backgroundColor: color }}
            >
              {initials}
            </div>
            <p className="text-xl font-bold text-gray-900">{nome}</p>
            <p className="text-sm text-gray-500">{email}</p>
          </div>

          {/* Info card */}
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100" style={{ border: "2px solid #e5e7eb" }}>
            <div className="px-5 py-4 flex items-start gap-3">
              <User size={18} className="text-[#E8560A] mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <EditProfileForm nome={nome} />
              </div>
            </div>
            <div className="px-5 py-4 flex items-start gap-3">
              <Mail size={18} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">E-mail</label>
                <p className="mt-1.5 text-base font-medium text-gray-900">{email}</p>
              </div>
            </div>
          </div>

          {/* Settings card */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: "2px solid #e5e7eb" }}>
            <LogoutButton variant="full" />
          </div>

        </div>

        <BottomNav />
      </div>
    </div>
  )
}
