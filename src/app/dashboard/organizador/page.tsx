import Link from 'next/link'
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  ShoppingBag,
  Clipboard,
  Map,
  Megaphone,
  Wrench,
  Settings,
  LogOut,
  Plus,
  BarChart3,
  Users,
  DollarSign,
  ClipboardList,
} from "lucide-react"
import Image from "next/image"

async function SidebarNav() {
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/organizador" },
    { icon: ShoppingBag, label: "Minhas Feiras", href: "/dashboard/organizador/feiras" },
    { icon: Clipboard, label: "Inscrições", href: "/dashboard/organizador/inscricoes" },
    { icon: Map, label: "Mapa", href: "/dashboard/organizador/mapa" },
    { icon: Megaphone, label: "Comunicados", href: "/dashboard/organizador/comunicados" },
    { icon: Wrench, label: "Serviços", href: "/dashboard/organizador/servicos" },
    { icon: Settings, label: "Configurações", href: "/dashboard/organizador/config" },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-0 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <img src="/feirinha-logo.svg" alt="Feirinha" width={40} height={40} />
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <a
          href="/auth/logout"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Sair</span>
        </a>
      </div>
    </aside>
  )
}

export default async function OrganizadorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome")
    .eq("id", user.id)
    .single()

  const { data: feiras } = await supabase
    .from("feiras")
    .select("*")
    .eq("organizador_id", user.id)
    .order("created_at", { ascending: false })

  const feiraList = feiras ?? []
  const feiraIds = feiraList.map((feira: any) => feira.id).filter(Boolean)

  const feirantesAtivosCount = feiraIds.length
    ? Number(
        (
          await supabase
            .from("inscricoes")
            .select("id", { count: "exact", head: true })
            .in("feira_id", feiraIds)
            .eq("status", "aprovado")
        ).count ?? 0
      )
    : 0

  const inscricoesPendentesCount = feiraIds.length
    ? Number(
        (
          await supabase
            .from("inscricoes")
            .select("id", { count: "exact", head: true })
            .in("feira_id", feiraIds)
            .eq("status", "pendente")
        ).count ?? 0
      )
    : 0

  const userName = profile?.nome || user.user_metadata?.nome || user.email || "Usuário"
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Bom dia"
    if (hour < 18) return "Boa tarde"
    return "Boa noite"
  }

  const formatDate = (value: string | null | undefined) => {
    if (!value) return "-"
    return new Date(value).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const friendlyStatus = (status: string | undefined) => {
    if (!status) return "-"
    const s = String(status).toLowerCase()
    if (s === "publicada") return "Publicada"
    if (s === "rascunho") return "Rascunho"
    if (s === "aprovado") return "Aprovada"
    if (s === "pendente") return "Pendente"
    if (s === "rejeitada" || s === "reprovado") return "Rejeitada"
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  const badgeVariantFor = (status: string | undefined) => {
    const s = String(status ?? "").toLowerCase()
    if (s === "rascunho") return "secondary"
    if (s === "publicada") return "default"
    if (s === "pendente") return "outline"
    return "default"
  }

  const metrics = [
    { label: "Total de Feiras", value: String(feiraList.length), icon: <BarChart3 className="h-5 w-5 text-orange-500" /> },
    { label: "Feirantes Ativos", value: String(feirantesAtivosCount), icon: <Users className="h-5 w-5 text-blue-500" /> },
    { label: "Receita do Mês", value: "R$ 0,00", icon: <DollarSign className="h-5 w-5 text-green-500" /> },
    { label: "Inscrições Pendentes", value: String(inscricoesPendentesCount), icon: <ClipboardList className="h-5 w-5 text-purple-500" /> },
  ]

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <SidebarNav />

      <main className="flex-1 ml-64">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="p-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getGreeting()}, <span className="text-[#E8560A]">{userName}</span>!
              </h1>
            </div>
            <img src="/feirinha-logo.svg" alt="Feirinha" width={48} height={48} />
          </div>
        </div>

        <div className="p-8">
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Métricas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((metric) => (
                <Card key={metric.label}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                      {metric.label}
                      <span className="text-xl">{metric.icon}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Minhas Feiras</h2>
              <Link href="/feiras/nova">
                <Button className="bg-[#E8560A] hover:bg-[#C4450A] gap-2">
                  <Plus size={18} />
                  Nova Feira
                </Button>
              </Link>
            </div>

            {feiraList.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500 text-base">Nenhuma feira criada ainda</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {feiraList.map((feira: any) => {
                  const capacidade = feira.capacidade_barracas ?? (feira.linhas && feira.colunas ? feira.linhas * feira.colunas : 0)

                  return (
                      <Link href={`/feiras/${feira.id}`} key={feira.id}>
                        <div className="cursor-pointer hover:shadow-md transition-shadow">
                          <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">{feira.nome}</CardTitle>
                          <p className="text-sm text-gray-500">{feira.cidade}</p>
                        </div>
                        <Badge variant={badgeVariantFor(feira.status)}>
                          {friendlyStatus(feira.status)}
                        </Badge>
                      </CardHeader>
                      <CardContent className="grid gap-3 md:grid-cols-3">
                        <div>
                          <p className="text-sm text-gray-600">Data</p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(feira.data_inicio)}
                            <span className="hidden sm:inline"> - </span>
                            <br className="sm:hidden" />
                            {formatDate(feira.data_fim)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Cidade</p>
                          <p className="font-semibold text-gray-900">{feira.cidade}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Capacidade</p>
                          <p className="font-semibold text-gray-900">{capacidade} barracas</p>
                        </div>
                      </CardContent>
                        </Card>
                      </div>
                    </Link>)})}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}


