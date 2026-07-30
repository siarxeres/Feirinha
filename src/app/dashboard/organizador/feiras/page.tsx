import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Store } from "lucide-react"
import { BottomNav } from "../_components/BottomNav"
import { PublicarButton } from "./_PublicarButton"

const STATUS_LABEL: Record<string, string> = {
  rascunho: "Rascunho",
  publicada: "Publicada",
}

const STATUS_STYLE: Record<string, string> = {
  rascunho: "bg-gray-100 text-gray-700",
  publicada: "bg-green-100 text-green-700",
}

function formatData(dataInicio: string | null, dataFim: string | null) {
  if (!dataInicio) return "Data não definida"
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" }
  const inicio = new Date(`${dataInicio}T00:00:00`).toLocaleDateString("pt-BR", opts)
  if (!dataFim || dataFim === dataInicio) return inicio
  const fim = new Date(`${dataFim}T00:00:00`).toLocaleDateString("pt-BR", opts)
  return `${inicio} – ${fim}`
}

export default async function FeirasOrganizadorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: feiras } = await supabase
    .from("feiras")
    .select("id, nome, status, data_inicio, data_fim")
    .eq("organizador_id", user.id)
    .order("data_inicio", { ascending: false })

  const lista = (feiras ?? []) as Array<{
    id: string
    nome: string
    status: string
    data_inicio: string | null
    data_fim: string | null
  }>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">

        <header className="px-5 pt-12 pb-5">
          <div className="flex items-center gap-2 mb-5">
            <img src="/feirinha-logo.svg" alt="Feirinha" width={36} height={36} />
            <span className="text-lg font-bold tracking-tight text-gray-900">Feirinha</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "#1A1A1A" }}>Minhas Feiras</h1>
        </header>

        <div className="flex-1 px-5 pb-28 space-y-3">
          {lista.length === 0 ? (
            <div className="rounded-2xl bg-white shadow-sm p-6 flex flex-col items-center text-center gap-3" style={{ border: "2px solid #e5e7eb" }}>
              <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center">
                <Store size={24} className="text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Você ainda não criou nenhuma feira</p>
                <p className="text-xs text-gray-500 mt-1">Crie sua primeira feira para começar a receber inscrições.</p>
              </div>
              <Link
                href="/feiras/nova"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white shadow-md transition-all active:scale-[0.98]"
                style={{ backgroundColor: "#E8560A" }}
              >
                <Plus size={18} />
                Criar feira
              </Link>
            </div>
          ) : (
            lista.map((feira) => (
              <div
                key={feira.id}
                className="rounded-2xl bg-white shadow-sm p-4 flex items-center justify-between gap-3"
                style={{ border: "2px solid #e5e7eb" }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{feira.nome}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatData(feira.data_inicio, feira.data_fim)}</p>
                  <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full mt-2 font-medium ${STATUS_STYLE[feira.status] ?? "bg-gray-100 text-gray-700"}`}>
                    {STATUS_LABEL[feira.status] ?? feira.status}
                  </span>
                </div>
                {feira.status === "rascunho" && <PublicarButton feiraId={feira.id} />}
              </div>
            ))
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  )
}
