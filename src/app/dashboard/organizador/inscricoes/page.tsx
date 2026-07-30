import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BottomNav } from "../_components/BottomNav"
import { ListaInscricoesPendentes } from "./_ListaInscricoesPendentes"

export default async function InscricoesOrganizadorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: feiras } = await supabase
    .from("feiras")
    .select("id")
    .eq("organizador_id", user.id)

  const feiraIds = (feiras ?? []).map((f: any) => f.id).filter(Boolean)

  const { data: inscricoes, error: inscricoesError } = feiraIds.length
    ? await supabase
        .from("inscricoes")
        .select("id, status, profiles(nome), feiras(nome)")
        .in("feira_id", feiraIds)
        .eq("status", "pendente")
        .order("created_at", { ascending: true })
    : { data: [], error: null }

  if (inscricoesError) {
    console.error("Erro ao buscar inscrições pendentes:", inscricoesError)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">

        <header className="px-4 pt-12 pb-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/organizador"
              className="text-gray-500 p-1 -ml-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft size={22} />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Inscrições pendentes</h1>
          </div>
        </header>

        <div className="flex-1 px-5 pb-28 pt-2">
          <ListaInscricoesPendentes inscricoes={(inscricoes ?? []) as any} />
        </div>

        <BottomNav />
      </div>
    </div>
  )
}
