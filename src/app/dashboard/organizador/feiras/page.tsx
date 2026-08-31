import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BottomNav } from "../_components/BottomNav"
import { FeirasListClient } from "./_FeirasListClient"
import { autoEncerrarFeirasVencidas } from "@/lib/auto-encerrar-feiras"

export default async function FeirasOrganizadorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  await autoEncerrarFeirasVencidas(supabase, user.id)

  const { data: feiras } = await supabase
    .from("feiras")
    .select("id, nome, status, data_inicio, data_fim, categorias")
    .eq("organizador_id", user.id)
    .order("data_inicio", { ascending: false })

  const lista = (feiras ?? []) as Array<{
    id: string
    nome: string
    status: string
    data_inicio: string | null
    data_fim: string | null
    categorias: string[] | null
  }>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">

        <header className="px-5 pt-12 pb-5">
          <div className="flex items-center gap-2 mb-5">
            <img src="/feirinha-logo.svg" alt="Feirinha" width={36} height={36} />
            <span className="text-lg font-bold tracking-tight text-gray-900">Feirinha</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Minhas Feiras</h1>
        </header>

        <div className="flex-1 px-5 pb-28">
          <FeirasListClient lista={lista} />
        </div>

        <BottomNav />
      </div>
    </div>
  )
}
