import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { CreditCard } from "lucide-react"
import { BottomNav } from "../_components/BottomNav"
import { LogoutButton } from "../_components/LogoutButton"
import { AssinaturaClient } from "./AssinaturaClient"

function adminDb() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function AssinaturaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const db = adminDb()

  const [{ data: profile }, { data: assinaturas }] = await Promise.all([
    supabase
      .from("profiles")
      .select("nome, assinatura_status, assinatura_expira_em, cpf_cnpj")
      .eq("id", user.id)
      .single(),
    db
      .from("assinaturas")
      .select("tipo, pix_payload, pix_qr_code, boleto_url, valor, vencimento")
      .eq("feirante_id", user.id)
      .eq("status", "aguardando")
      .order("created_at", { ascending: false })
      .limit(1),
  ])

  const p = profile as any
  const status   = p?.assinatura_status   ?? "inativa"
  const expiraEm = p?.assinatura_expira_em ?? null
  const cpfCnpj  = p?.cpf_cnpj            ?? null

  const pendente = (assinaturas as any[])?.[0] ?? null
  const pagamentoPendente = pendente
    ? {
        tipo:       pendente.tipo       as "PIX" | "BOLETO",
        pixPayload: pendente.pix_payload ?? null,
        pixQrCode:  pendente.pix_qr_code ?? null,
        boletoUrl:  pendente.boleto_url  ?? null,
        valor:      pendente.valor,
      }
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">

        {/* Header */}
        <header className="px-5 pt-12 pb-5 bg-gray-50">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <img src="/feirinha-logo.svg" alt="Feirinha" width={36} height={36} />
              <span className="text-lg font-bold tracking-tight text-gray-900">Feirinha</span>
            </div>
            <LogoutButton />
          </div>
          <div className="flex items-center gap-2">
            <CreditCard size={22} style={{ color: "#E8560A" }} />
            <h1 className="text-2xl font-bold text-gray-900">Minha Assinatura</h1>
          </div>
        </header>

        <div className="flex-1 px-5 pb-28">
          <AssinaturaClient
            status={status}
            expiraEm={expiraEm}
            cpfCnpj={cpfCnpj}
            pagamentoPendente={pagamentoPendente}
          />
        </div>

        <BottomNav />
      </div>
    </div>
  )
}
