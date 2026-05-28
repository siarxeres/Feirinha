import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"
import { criarOuBuscarCliente, gerarCobrancaPix, gerarCobrancaBoleto } from "@/lib/asaas"
import { NextRequest } from "next/server"

function adminDb() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Não autenticado." }, { status: 401 })

  let body: { cpfCnpj?: string; tipo?: "PIX" | "BOLETO" }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "JSON inválido." }, { status: 400 })
  }

  const tipo = body.tipo === "BOLETO" ? "BOLETO" : "PIX"

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, cpf_cnpj, asaas_customer_id, assinatura_status")
    .eq("id", user.id)
    .single()

  const cpfCnpj = (body.cpfCnpj?.replace(/\D/g, "")) || (profile as any)?.cpf_cnpj
  if (!cpfCnpj || (cpfCnpj.length !== 11 && cpfCnpj.length !== 14)) {
    return Response.json({ error: "CPF ou CNPJ obrigatório." }, { status: 400 })
  }

  const db = adminDb()

  // Salva cpf_cnpj no perfil se fornecido na requisição
  if (body.cpfCnpj) {
    await db.from("profiles").update({ cpf_cnpj: cpfCnpj }).eq("id", user.id)
  }

  let customer: any
  try {
    customer = await criarOuBuscarCliente({
      nome: (profile as any)?.nome || user.email!,
      email: user.email!,
      cpfCnpj,
    })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 502 })
  }

  if (!customer?.id) {
    return Response.json({ error: "Erro ao criar cliente no Asaas." }, { status: 502 })
  }

  await db.from("profiles").update({ asaas_customer_id: customer.id }).eq("id", user.id)

  const valor = Number(process.env.ASAAS_SUBSCRIPTION_VALUE ?? "29.90")
  const cobrancaParams = {
    customerId: customer.id,
    valor,
    descricao: "Assinatura mensal Feirinha",
    externalReference: user.id,
  }

  let charge: any
  try {
    charge = tipo === "BOLETO"
      ? await gerarCobrancaBoleto(cobrancaParams)
      : await gerarCobrancaPix(cobrancaParams)
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 502 })
  }

  await db.from("assinaturas").insert({
    feirante_id:      user.id,
    asaas_payment_id: charge.chargeId,
    asaas_customer_id: customer.id,
    valor,
    status:    "aguardando",
    tipo,
    pix_payload: charge.pixPayload ?? null,
    pix_qr_code: charge.pixQrCode  ?? null,
    boleto_url:  charge.boletoUrl   ?? null,
    vencimento:  charge.dueDate     ?? null,
  })

  await db.from("profiles").update({ assinatura_status: "pendente" }).eq("id", user.id)

  return Response.json(charge)
}
