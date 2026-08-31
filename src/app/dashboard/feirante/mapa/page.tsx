import { createClient, createAdminClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MapPin } from "lucide-react"
import { BottomNav } from "../_components/BottomNav"
import { EmptyState } from "@/components/EmptyState"

export default async function MapaFeirantePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Admin client bypassa RLS — a policy de "feiras" só libera SELECT pra
  // não-dono quando status = "publicada", então o embed vinha null (e a
  // feira sumia da lista) pra inscrições aprovadas em feiras já encerradas.
  // Autorização garantida por .eq("feirante_id", ...).
  const admin = createAdminClient()
  const { data: inscricoes } = await admin
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
          <h1 className="text-3xl font-bold" style={{ color: "#1A1A1A" }}>Localização</h1>
        </header>

        <div className="flex-1 px-5 pb-28 space-y-3">
          {feirasAprovadas.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="Nenhuma localização para mostrar ainda"
              description="Assim que uma inscrição sua for aprovada, o endereço da feira aparece aqui."
              action={{ label: "Ver feiras disponíveis", href: "/dashboard/feirante" }}
              card
            />
          ) : (
            feirasAprovadas.map((feira: any) => {
              const enderecoCompleto = `${feira.endereco ? `${feira.endereco}, ` : ""}${feira.cidade}, ${feira.estado}`
              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`
              return (
                <div
                  key={feira.id}
                  className="rounded-2xl bg-white shadow-sm p-4 border-2 border-gray-200"
                >
                  <p className="text-sm font-bold text-gray-900 mb-1">{feira.nome}</p>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs hover:underline text-primary"
                  >
                    <MapPin size={12} />
                    {enderecoCompleto}
                  </a>
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
