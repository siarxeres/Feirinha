import { createClient, createAdminClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Megaphone } from "lucide-react"
import { BottomNav } from "../_components/BottomNav"
import { EmptyState } from "@/components/EmptyState"

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

const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Filtro só de exibição — não apaga nem altera nada no banco. Some da lista
 * quando já passou mais de 1 semana do fim da feira (data_fim); feiras ainda
 * ativas ou sem data_fim continuam aparecendo normalmente.
 */
function dentroDoPrazoDeExibicao(dataFim: string | null | undefined): boolean {
  if (!dataFim) return true
  const fimDoUltimoDia = new Date(`${dataFim}T23:59:59`).getTime()
  return Date.now() - fimDoUltimoDia < SETE_DIAS_MS
}

export default async function AvisosFeirantePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Só comunicados das feiras em que o feirante tem inscrição — sem esse
  // filtro, trocar pra admin client abaixo mostraria comunicados de feiras
  // de outros organizadores, sem relação nenhuma com o feirante.
  const { data: minhasInscricoes } = await supabase
    .from("inscricoes")
    .select("feira_id")
    .eq("feirante_id", user.id)

  const feiraIds = Array.from(
    new Set((minhasInscricoes ?? []).map((i: any) => i.feira_id).filter(Boolean))
  ) as string[]

  // Admin client bypassa RLS — a policy de "feiras" só libera SELECT pra
  // não-dono quando status = "publicada", então o embed feiras(nome) vinha
  // null pra feiras encerradas. Autorização garantida pelo filtro acima.
  const admin = createAdminClient()
  const { data: comunicados } = feiraIds.length
    ? await admin
        .from("comunicados")
        .select("id, conteudo, created_at, feira_id, feiras(nome, data_fim)")
        .in("feira_id", feiraIds)
        .order("created_at", { ascending: false })
    : { data: [] }

  const lista = ((comunicados ?? []) as any[]).filter((comunicado) => {
    const feiraData = Array.isArray(comunicado.feiras) ? comunicado.feiras[0] : comunicado.feiras
    return dentroDoPrazoDeExibicao(feiraData?.data_fim)
  })

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
            <EmptyState
              icon={Megaphone}
              title="Nenhum aviso ainda"
              description="Os comunicados dos organizadores das feiras em que você está inscrito aparecem aqui."
              card
            />
          ) : (
            lista.map((comunicado: any) => {
              const feiraData = Array.isArray(comunicado.feiras) ? comunicado.feiras[0] : comunicado.feiras
              const nomeFeira = feiraData?.nome ?? "Feira"
              return (
                <div
                  key={comunicado.id}
                  className="rounded-2xl bg-white shadow-sm p-4 border-2 border-gray-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Megaphone size={14} className="text-primary" />
                    <p className="text-xs font-bold uppercase tracking-wide text-primary">
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
