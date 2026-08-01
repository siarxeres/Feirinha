import { createClient, createAdminClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Store, Users, ShoppingBag, MapPin, CalendarDays, ClipboardList, ArrowRight, CheckCircle2 } from "lucide-react"

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Painel a oferecer no atalho da landing: nunca o admin (painel interno,
  // não deve ser exposto pela tela pública). Prioriza organizador > feirante > consumidor.
  let painelHref: string | null = null
  if (user) {
    const admin = createAdminClient()
    const { data: profile } = await admin
      .from("profiles")
      .select("roles")
      .eq("id", user.id)
      .maybeSingle() as unknown as { data: { roles: unknown } | null }

    const rawRoles = profile?.roles
    let roles: string[] = []
    if (Array.isArray(rawRoles)) {
      roles = rawRoles
    } else if (typeof rawRoles === 'string') {
      roles = rawRoles
        .replace(/^\{|\}$/g, '')
        .split(',')
        .map(r => r.trim().replace(/^"|"$/g, ''))
        .filter(Boolean)
    }

    if (roles.includes("organizador")) painelHref = "/dashboard/organizador"
    else if (roles.includes("feirante")) painelHref = "/dashboard/feirante"
    else if (roles.includes("consumidor")) painelHref = "/dashboard/consumidor"
    // admin puro (sem outro papel) → painelHref continua null, botão não aparece
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Header ── */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/feirinha-logo.svg" alt="Feirinha" width={36} height={36} />
            <span className="text-lg font-bold text-gray-900">Feirinha</span>
          </div>
          <nav className="flex items-center gap-3">
            {painelHref ? (
              <Link
                href={painelHref}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: "#E8560A" }}
              >
                Ir ao painel
                <ArrowRight size={14} />
              </Link>
            ) : !user ? (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2"
                >
                  Entrar
                </Link>
                <Link
                  href="/auth/cadastro"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ backgroundColor: "#E8560A" }}
                >
                  Criar conta
                </Link>
              </>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="py-20 px-5 text-center" style={{ background: "linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)" }}>
          <div className="max-w-2xl mx-auto">
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
              style={{ backgroundColor: "#fff0e6", color: "#E8560A", border: "1px solid #fcd5b8" }}
            >
              Apresentado à APRAMAR
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
              Chega de controlar a feira no{" "}
              <span style={{ color: "#E8560A" }}>caderno</span> e no{" "}
              <span style={{ color: "#E8560A" }}>WhatsApp</span>.
            </h1>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              Organize inscrições, presença e o rateio de despesas — automático e
              transparente pra todo mundo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/cadastro"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base font-bold text-white shadow-md transition-all hover:scale-105 active:scale-100"
                style={{ backgroundColor: "#E8560A" }}
              >
                Começar agora
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Personas ── */}
        <section className="py-16 px-5">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">Para quem é?</h2>
            <p className="text-center text-gray-500 mb-10">Três perfis, uma plataforma integrada.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

              <div className="rounded-3xl p-6 flex flex-col gap-4" style={{ backgroundColor: "#fff7ed", border: "2px solid #fed7aa" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#E8560A" }}>
                  <ClipboardList size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Organizadores</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Publique feiras, gerencie inscrições, aprove feirantes e controle a capacidade em tempo real.
                  </p>
                </div>
                <ul className="space-y-2 mt-auto">
                  {["Criar e publicar feiras", "Aprovar feirantes", "Gestão de inscrições"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 size={14} style={{ color: "#E8560A" }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl p-6 flex flex-col gap-4" style={{ backgroundColor: "#f0fdf4", border: "2px solid #bbf7d0" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#1D9E75" }}>
                  <Store size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Feirantes</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Cadastre-se, assine o plano e inscreva-se nas feiras da sua região com poucos cliques.
                  </p>
                </div>
                <ul className="space-y-2 mt-auto">
                  {["Buscar feiras disponíveis", "Solicitar inscrição", "Acompanhar aprovações"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 size={14} style={{ color: "#1D9E75" }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl p-6 flex flex-col gap-4" style={{ backgroundColor: "#eff6ff", border: "2px solid #bfdbfe" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#3b82f6" }}>
                  <ShoppingBag size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Consumidores</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Descubra feiras próximas, explore produtos locais e acompanhe eventos na sua cidade.
                  </p>
                </div>
                <ul className="space-y-2 mt-auto">
                  {["Encontrar feiras no mapa", "Ver feiras em destaque", "Explorar categorias"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 size={14} style={{ color: "#3b82f6" }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* ── Funcionalidades ── */}
        <section className="py-16 px-5 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">Como funciona</h2>
            <p className="text-center text-gray-500 mb-10">Da criação ao evento em quatro etapas simples.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {[
                { icon: Users, step: "1", title: "Crie sua conta", desc: "Escolha seu perfil: organizador, feirante ou consumidor.", color: "#E8560A" },
                { icon: ClipboardList, step: "2", title: "Complete o perfil", desc: "Preencha seus dados e aguarde aprovação (feirantes).", color: "#1D9E75" },
                { icon: MapPin, step: "3", title: "Explore as feiras", desc: "Veja feiras por localização, categoria e data.", color: "#3b82f6" },
                { icon: CalendarDays, step: "4", title: "Conecte-se", desc: "Inscreva-se, aprove e gerencie — tudo em um lugar.", color: "#8b5cf6" },
              ].map(({ icon: Icon, step, title, desc, color }) => (
                <div key={step} className="bg-white rounded-2xl p-5 shadow-sm text-center flex flex-col items-center gap-3">
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: color }}
                  >
                    {step}
                  </span>
                  <Icon size={20} style={{ color }} />
                  <div>
                    <p className="font-bold text-sm text-gray-900">{title}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA final ── */}
        <section className="py-20 px-5 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Pronto para digitalizar sua feira?
            </h2>
            <p className="text-gray-500 mb-8">
              Junte-se à plataforma e leve a gestão de feiras livres para outro nível.
            </p>
            <Link
              href="/auth/cadastro"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-100"
              style={{ backgroundColor: "#E8560A" }}
            >
              Criar conta gratuita
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <img src="/feirinha-logo.svg" alt="" width={22} height={22} />
            <span>Feirinha</span>
          </div>
          <span>© {new Date().getFullYear()} Feirinha. Apresentado à APRAMAR.</span>
          <div className="flex gap-4">
            <Link href="/auth/login" className="hover:text-gray-600">Entrar</Link>
            <Link href="/auth/cadastro" className="hover:text-gray-600">Cadastrar</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
