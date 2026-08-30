import { createClient, createAdminClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BottomNav } from "../_components/BottomNav"
import { InscricoesListClient } from "./_InscricoesListClient"

export default async function InscricoesFeirantePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Admin client bypassa RLS — a policy de "feiras" só deixa não-donos lerem
  // feiras com status "publicada", então o embed abaixo voltava null pra
  // qualquer inscrição em feira já encerrada. Autorização já é garantida
  // pelo filtro feirante_id = user.id (o feirante só vê as próprias inscrições).
  const admin = createAdminClient()
  const { data: inscricoes } = await admin
    .from("inscricoes")
    .select("id, status, created_at, feira_id, barraca_id, feiras(id, nome, status, cidade, estado, data_inicio, data_fim), barracas(id, codigo, numero)")
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

        <div className="flex-1 px-5 pb-28">
          <InscricoesListClient lista={lista} />
        </div>

        <BottomNav />
      </div>
    </div>
  )
}
