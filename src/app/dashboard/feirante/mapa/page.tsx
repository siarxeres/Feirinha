import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Map, MapPin } from "lucide-react"
import { BottomNav } from "../_components/BottomNav"

export default async function MapaFeirantePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: inscricoes } = await supabase
    .from("inscricoes")
    .select("id, status, feiras(id, nome, cidade, estado, endereco, latitude, longitude)")
    .eq("feirante_id", user.id)
    .eq("status", "aprovada")

  const feirasAprovadas = (inscricoes ?? []).map((i: any) => {
    const f = Array.isArray(i.feiras) ? i.feiras[0] : i.feiras
    return f
  }).filter(Boolean) as any[]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">

        <header className="px-5 pt-12 pb-5">
          <div className="flex items-center gap-2 mb-5">
            <img src="/feirinha-logo.svg" alt="Feirinha" width={36} height={36} />
            <span className="text-lg font-bold tracking-tight text-gray-900">Feirinha</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "#1A1A1A" }}>Mapa</h1>
        </header>

        <div className="flex-1 px-5 pb-28 space-y-3">
          {feirasAprovadas.length === 0 ? (
            <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-10 text-center">
              <Map size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Nenhuma feira aprovada para exibir no mapa.</p>
            </div>
          ) : (
            feirasAprovadas.map((feira: any) => (
              <div
                key={feira.id}
                className="rounded-2xl bg-white shadow-sm p-4"
                style={{ border: "2px solid #e5e7eb" }}
              >
                <p className="text-sm font-bold text-gray-900 mb-1">{feira.nome}</p>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin size={12} />
                  {feira.endereco ? `${feira.endereco}, ` : ""}{feira.cidade}, {feira.estado}
                </span>
              </div>
            ))
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  )
}
