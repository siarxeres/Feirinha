import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Store, MapPin, CalendarDays, Plus, Users } from "lucide-react"
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
  if (status === "publicada") return { label: "Publicada", cls: "bg-green-100 text-green-700" }
  if (status === "rascunho")  return { label: "Rascunho",  cls: "bg-gray-100 text-gray-600" }
  if (status === "encerrada") return { label: "Encerrada", cls: "bg-red-100 text-red-700" }
  return { label: status, cls: "bg-gray-100 text-gray-600" }
}

export default async function FeirasOrganizadorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: feiras } = await supabase
    .from("feiras")
    .select("id, nome, cidade, estado, data_inicio, data_fim, status, capacidade_barracas")
    .eq("organizador_id", user.id)
    .order("created_at", { ascending: false })

  const lista = feiras ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">

        <header className="px-5 pt-12 pb-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <img src="/feirinha-logo.svg" alt="Feirinha" width={36} height={36} />
              <span className="text-lg font-bold tracking-tight text-gray-900">Feirinhas</span>
            </div>
            <Link
              href="/feiras/nova"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: "#E8560A" }}
            >
              <Plus size={14} />
              Nova
            </Link>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "#1A1A1A" }}>Minhas Feiras</h1>
        </header>

        <div className="flex-1 px-5 pb-28 space-y-3">
          {lista.length === 0 ? (
            <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-10 text-center">
              <Store size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400 mb-4">Nenhuma feira criada ainda.</p>
              <Link
                href="/feiras/nova"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: "#E8560A" }}
              >
                <Plus size={16} />
                Criar primeira feira
              </Link>
            </div>
          ) : (
            lista.map(feira => {
              const badge = statusBadge(feira.status ?? "rascunho")
              return (
                <Link
                  key={feira.id}
                  href={`/feiras/${feira.id}`}
                  className="block rounded-2xl bg-white shadow-sm overflow-hidden"
                  style={{ border: "2px solid #e5e7eb" }}
                >
                  <div
                    className="h-14 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #E8560A 0%, #f97316 100%)" }}
                  >
                    <Store size={24} className="text-white opacity-80" />
                  </div>
                  <div className="px-4 pt-3 pb-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-bold text-gray-900 leading-snug">{feira.nome}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
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
                          <Users size={12} />
                          {feira.capacidade_barracas} barracas
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  )
}
