import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { Map } from "lucide-react"
import { BottomNav } from "../_components/BottomNav"
import { MapaFeirasClient } from "./MapaFeirasClient"
import { dataDeHojeISO } from "@/lib/feira-status"

export default async function MapaConsumidorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data } = await adminClient
    .from("feiras")
    .select("id, nome, cidade, estado, endereco, data_inicio, data_fim, categorias, foto_capa_url")
    .eq("status", "publicada")
    .gte("data_fim", dataDeHojeISO())
    .order("data_inicio", { ascending: true })

  const feiras = (data ?? []) as any[]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">

        {/* Header */}
        <header className="px-5 pt-12 pb-5 bg-gray-50">
          <div className="flex items-center gap-2 mb-5">
            <img src="/feirinha-logo.svg" alt="Feirinha" width={36} height={36} />
            <span className="text-lg font-bold tracking-tight text-gray-900">Feirinha</span>
          </div>
          <div className="flex items-center gap-2">
            <Map size={22} style={{ color: "#E8560A" }} />
            <h1 className="text-2xl font-bold text-gray-900">Mapa de Feiras</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {feiras.length} feira{feiras.length !== 1 ? "s" : ""} publicada{feiras.length !== 1 ? "s" : ""}
          </p>
        </header>

        <MapaFeirasClient feiras={feiras} />

        <BottomNav />
      </div>
    </div>
  )
}
