import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClipboardList, MapPin, CalendarDays } from "lucide-react"
import { BottomNav } from "../_components/BottomNav"

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  return new Date(value + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function statusBadge(status: string) {
  if (status === "aprovada")     return { label: "Aprovada",        cls: "bg-green-100 text-green-700" }
  if (status === "pendente")     return { label: "Pendente",        cls: "bg-yellow-100 text-yellow-700" }
  if (status === "rejeitada")    return { label: "Rejeitada",       cls: "bg-red-100 text-red-700" }
  if (status === "lista_espera") return { label: "Lista de espera", cls: "bg-gray-100 text-gray-600" }
  return { label: status, cls: "bg-gray-100 text-gray-600" }
}

const AVATAR_COLORS = ["bg-purple-500", "bg-blue-500", "bg-green-500", "bg-pink-500", "bg-yellow-500", "bg-indigo-500", "bg-teal-500"]

function initials(name: string | null | undefined) {
  if (!name) return "?"
  return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("")
}

function avatarBg(name: string | null | undefined, id: string) {
  const seed = (name?.charCodeAt(0) ?? 0) + (id.charCodeAt(0) ?? 0)
  return AVATAR_COLORS[seed % AVATAR_COLORS.length]
}

export default async function InscricoesFeirantePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: inscricoes } = await supabase
    .from("inscricoes")
    .select("id, status, created_at, feira_id, feiras(id, nome, cidade, estado, data_inicio, data_fim)")
    .eq("feirante_id", user.id)
    .order("created_at", { ascending: false })

  const lista = (inscricoes ?? []) as any[]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">

        <header className="px-5 pt-12 pb-5">
          <div className="flex items-center gap-2 mb-5">
            <img src="/feirinha-logo.svg" alt="Feirinha" width={36} height={36} />
            <span className="text-lg font-bold tracking-tight text-gray-900">Feirinha</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "#1A1A1A" }}>Minhas Inscrições</h1>
        </header>

        <div className="flex-1 px-5 pb-28 space-y-3">
          {lista.length === 0 ? (
            <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-10 text-center">
              <ClipboardList size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Nenhuma inscrição ainda.</p>
            </div>
          ) : (
            lista.map((insc: any) => {
              const feiraData = Array.isArray(insc.feiras) ? insc.feiras[0] : insc.feiras
              const nomeFeira = feiraData?.nome ?? "Feira"
              const badge = statusBadge(insc.status)
              return (
                <div
                  key={insc.id}
                  className="rounded-2xl bg-white shadow-sm overflow-hidden"
                  style={{ border: "2px solid #e5e7eb" }}
                >
                  <div className="flex items-center gap-3 p-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${avatarBg(nomeFeira, insc.id)}`}>
                      {initials(nomeFeira)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-bold text-gray-900 truncate">{nomeFeira}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {feiraData?.cidade && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin size={11} />
                            {feiraData.cidade}, {feiraData.estado}
                          </span>
                        )}
                        {feiraData?.data_inicio && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <CalendarDays size={11} />
                            {formatDate(feiraData.data_inicio)} – {formatDate(feiraData.data_fim)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  )
}
