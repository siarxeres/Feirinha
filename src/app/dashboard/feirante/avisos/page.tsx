import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Megaphone } from "lucide-react"
import { BottomNav } from "../_components/BottomNav"

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function AvisosFeirantePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: comunicados } = await supabase
    .from("comunicados")
    .select("id, conteudo, created_at, feira_id, feiras(nome)")
    .order("created_at", { ascending: false })

  const lista = (comunicados ?? []) as any[]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">

        <header className="px-5 pt-12 pb-5">
          <div className="flex items-center gap-2 mb-5">
            <img src="/feirinha-logo.svg" alt="Feirinha" width={36} height={36} />
            <span className="text-lg font-bold tracking-tight text-gray-900">Feirinha</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "#1A1A1A" }}>Avisos</h1>
        </header>

        <div className="flex-1 px-5 pb-28 space-y-3">
          {lista.length === 0 ? (
            <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-10 text-center">
              <Megaphone size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Nenhum aviso ainda.</p>
            </div>
          ) : (
            lista.map((comunicado: any) => {
              const feiraData = Array.isArray(comunicado.feiras) ? comunicado.feiras[0] : comunicado.feiras
              const nomeFeira = feiraData?.nome ?? "Feira"
              return (
                <div
                  key={comunicado.id}
                  className="rounded-2xl bg-white shadow-sm p-4"
                  style={{ border: "2px solid #e5e7eb" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Megaphone size={14} style={{ color: "#E8560A" }} />
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#E8560A" }}>
                      {nomeFeira}
                    </p>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap mb-2">{comunicado.conteudo}</p>
                  <p className="text-xs text-gray-400">{formatDate(comunicado.created_at)}</p>
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
