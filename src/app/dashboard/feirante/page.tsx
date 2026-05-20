import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ClipboardList, CheckCircle2, Clock, LogOut, MapPin, CalendarDays, Store } from "lucide-react"

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  return new Date(value + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const statusInscricao: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pendente:     { label: "Pendente",     variant: "outline" },
  aprovada:     { label: "Aprovada",     variant: "default" },
  rejeitada:    { label: "Rejeitada",    variant: "destructive" },
  lista_espera: { label: "Lista de espera", variant: "secondary" },
  cancelada:    { label: "Cancelada",    variant: "secondary" },
}

export default async function FeirantePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const [{ data: profile }, { data: inscricoes }, { data: feirasPublicadas }] = await Promise.all([
    supabase
      .from("profiles")
      .select("nome")
      .eq("id", user.id)
      .single(),

    supabase
      .from("inscricoes")
      .select("id, status, created_at, feira_id, feiras(id, nome, cidade, estado, data_inicio, data_fim)")
      .eq("feirante_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("feiras")
      .select("id, nome, cidade, estado, data_inicio, data_fim, capacidade_barracas, taxa_inscricao, taxa_barraca, categorias")
      .eq("status", "publicada")
      .order("data_inicio", { ascending: true }),
  ])

  const nome = profile?.nome || user.user_metadata?.nome || user.email || "Feirante"
  const lista = inscricoes ?? []
  const feiras = feirasPublicadas ?? []

  const totalInscricoes = lista.length
  const aprovadas = lista.filter(i => i.status === "aprovada").length
  const pendentes = lista.filter(i => i.status === "pendente").length

  // IDs de feiras em que o feirante já está inscrito
  const inscritasIds = new Set(lista.map(i => i.feira_id).filter(Boolean))

  const metrics = [
    {
      label: "Minhas Inscrições",
      value: totalInscricoes,
      icon: <ClipboardList className="h-5 w-5 text-orange-500" />,
    },
    {
      label: "Aprovadas",
      value: aprovadas,
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    },
    {
      label: "Pendentes",
      value: pendentes,
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/feirinha-logo.svg" alt="Feirinha" width={36} height={36} />
            <h1 className="text-xl font-bold text-gray-900">
              Olá, <span className="text-[#E8560A]">{nome}</span>!
            </h1>
          </div>
          <a
            href="/auth/logout"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
          >
            <LogOut size={16} />
            Sair
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">

        {/* Métricas */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {metrics.map(m => (
              <Card key={m.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
                    {m.label}
                    {m.icon}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">{m.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Minhas inscrições */}
        {lista.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Minhas Inscrições</h2>
            <div className="grid gap-3">
              {lista.map(i => {
                const feira = Array.isArray(i.feiras) ? i.feiras[0] : i.feiras
                const s = statusInscricao[i.status] ?? { label: i.status, variant: "secondary" as const }
                return (
                  <Card key={i.id}>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{feira?.nome ?? "Feira"}</p>
                        <p className="text-sm text-gray-500">
                          {feira?.cidade && feira?.estado ? `${feira.cidade}, ${feira.estado}` : "—"}
                          {feira?.data_inicio ? ` · ${formatDate(feira.data_inicio)}` : ""}
                        </p>
                      </div>
                      <Badge variant={s.variant}>{s.label}</Badge>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {/* Feiras disponíveis */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Feiras Disponíveis</h2>

          {feiras.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">Nenhuma feira publicada no momento.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {feiras.map(feira => {
                const jaInscrito = inscritasIds.has(feira.id)
                const categorias: string[] = Array.isArray(feira.categorias) ? feira.categorias : []

                return (
                  <Card key={feira.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold text-gray-900">
                            {feira.nome}
                          </CardTitle>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <MapPin size={13} />
                              {feira.cidade}, {feira.estado}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <CalendarDays size={13} />
                              {formatDate(feira.data_inicio)} – {formatDate(feira.data_fim)}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <Store size={13} />
                              {feira.capacidade_barracas ?? "—"} barracas
                            </span>
                          </div>
                        </div>

                        {jaInscrito ? (
                          <Badge variant="secondary">Inscrito</Badge>
                        ) : (
                          <Link href={`/feiras/${feira.id}/inscricao`}>
                            <Button size="sm" className="bg-[#E8560A] hover:bg-[#C4450A] shrink-0">
                              Me inscrever
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardHeader>

                    {(categorias.length > 0 || feira.taxa_inscricao || feira.taxa_barraca) && (
                      <CardContent className="pt-0 pb-4 flex flex-wrap gap-2 items-center">
                        {categorias.map((cat: string) => (
                          <span
                            key={cat}
                            className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full border border-orange-200 capitalize"
                          >
                            {cat}
                          </span>
                        ))}
                        {(feira.taxa_inscricao > 0 || feira.taxa_barraca > 0) && (
                          <span className="ml-auto text-xs text-gray-500">
                            {feira.taxa_inscricao > 0 && `Inscrição: R$ ${Number(feira.taxa_inscricao).toFixed(2)}`}
                            {feira.taxa_inscricao > 0 && feira.taxa_barraca > 0 && " · "}
                            {feira.taxa_barraca > 0 && `Barraca: R$ ${Number(feira.taxa_barraca).toFixed(2)}`}
                          </span>
                        )}
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
