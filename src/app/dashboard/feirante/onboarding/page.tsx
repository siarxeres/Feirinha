import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { OnboardingClient } from "./OnboardingClient"

function adminDb() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const db = adminDb()

  const [{ data: profile }, { data: assinaturas }] = await Promise.all([
    supabase
      .from("profiles")
      .select("nome, cpf_cnpj, aprovacao_status, roles")
      .eq("id", user.id)
      .single(),

    db
      .from("assinaturas")
      .select("tipo, pix_payload, pix_qr_code, boleto_url, valor")
      .eq("feirante_id", user.id)
      .eq("status", "aguardando")
      .order("created_at", { ascending: false })
      .limit(1),
  ])

  const p = profile as any
  const aprovacaoStatus = p?.aprovacao_status ?? null
  const roles: string[] = p?.roles ?? user.user_metadata?.roles ?? []

  // Não é feirante → vai para o dashboard
  if (!roles.includes("feirante")) redirect("/dashboard")

  // Já aprovado → não precisa de onboarding
  if (aprovacaoStatus === "aprovado") redirect("/dashboard/feirante")

  const pendente = (assinaturas as any[])?.[0] ?? null

  let initialCobranca = null
  if (pendente) {
    if (pendente.tipo === "PIX") {
      initialCobranca = {
        tipo: "PIX" as const,
        pixPayload: pendente.pix_payload ?? "",
        pixQrCode: pendente.pix_qr_code ?? null,
        valor: pendente.valor,
      }
    } else {
      initialCobranca = {
        tipo: "BOLETO" as const,
        boletoUrl: pendente.boleto_url ?? "",
        valor: pendente.valor,
      }
    }
  }

  // Determina o passo inicial baseado no estado atual
  let initialStep: 1 | 2 | 3 | 4 = 1
  if (aprovacaoStatus === "aguardando_aprovacao" && initialCobranca) {
    initialStep = 4
  } else if (initialCobranca) {
    initialStep = 4
  } else if (p?.cpf_cnpj) {
    initialStep = 2
  }

  return (
    <OnboardingClient
      initialNome={p?.nome ?? user.user_metadata?.nome ?? ""}
      initialCpfCnpj={p?.cpf_cnpj ?? null}
      initialCobranca={initialCobranca}
      initialStep={initialStep}
    />
  )
}
