"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { criarOuBuscarCliente, gerarCobrancaPix, gerarCobrancaBoleto } from "@/lib/asaas"

function adminDb() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

type ResultadoPix = {
  success: true
  tipo: "PIX"
  pixPayload: string
  pixQrCode: string
  chargeId: string
  valor: number
}
type ResultadoBoleto = {
  success: true
  tipo: "BOLETO"
  boletoUrl: string
  chargeId: string
  valor: number
}
type Erro = { error: string }

export async function iniciarAssinatura(
  cpfCnpj: string,
  tipo: "PIX" | "BOLETO" = "PIX"
): Promise<ResultadoPix | ResultadoBoleto | Erro> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const limpo = cpfCnpj.replace(/\D/g, "")
  if (limpo.length !== 11 && limpo.length !== 14) {
    return { error: "CPF ou CNPJ inválido. Digite apenas os números." }
  }

  const db = adminDb()

  // Reutiliza cobrança pendente existente para o mesmo tipo
  const { data: existentes } = await db
    .from("assinaturas")
    .select("*")
    .eq("feirante_id", user.id)
    .eq("status", "aguardando")
    .eq("tipo", tipo)
    .order("created_at", { ascending: false })
    .limit(1)

  const existente = existentes?.[0]
  if (existente) {
    if (tipo === "PIX") {
      return {
        success: true,
        tipo: "PIX",
        pixPayload: existente.pix_payload,
        pixQrCode:  existente.pix_qr_code,
        chargeId:   existente.asaas_payment_id,
        valor:      existente.valor,
      }
    }
    return {
      success: true,
      tipo: "BOLETO",
      boletoUrl: existente.boleto_url,
      chargeId:  existente.asaas_payment_id,
      valor:     existente.valor,
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome")
    .eq("id", user.id)
    .single()

  // Salva CPF/CNPJ no perfil
  await db.from("profiles").update({ cpf_cnpj: limpo }).eq("id", user.id)

  let customer: any
  try {
    customer = await criarOuBuscarCliente({
      nome:     (profile as any)?.nome || user.email!,
      email:    user.email!,
      cpfCnpj:  limpo,
    })
  } catch (err: any) {
    return { error: `Erro ao conectar com o serviço de pagamentos: ${err.message}` }
  }

  if (!customer?.id) {
    return { error: "Não foi possível criar o cliente no Asaas. Verifique o CPF/CNPJ." }
  }

  await db.from("profiles").update({ asaas_customer_id: customer.id }).eq("id", user.id)

  const valor = Number(process.env.ASAAS_SUBSCRIPTION_VALUE ?? "29.90")
  const cobrancaParams = {
    customerId:        customer.id,
    valor,
    descricao:         "Assinatura mensal Feirinha",
    externalReference: user.id,
  }

  try {
    if (tipo === "BOLETO") {
      const charge = await gerarCobrancaBoleto(cobrancaParams)
      await db.from("assinaturas").insert({
        feirante_id:       user.id,
        asaas_payment_id:  charge.chargeId,
        asaas_customer_id: customer.id,
        valor,
        status:    "aguardando",
        tipo:      "BOLETO",
        boleto_url: charge.boletoUrl,
        vencimento: charge.dueDate,
      })
      await db.from("profiles").update({ assinatura_status: "pendente" }).eq("id", user.id)
      return { success: true, tipo: "BOLETO", boletoUrl: charge.boletoUrl, chargeId: charge.chargeId, valor }
    }

    const charge = await gerarCobrancaPix(cobrancaParams)
    await db.from("assinaturas").insert({
      feirante_id:       user.id,
      asaas_payment_id:  charge.chargeId,
      asaas_customer_id: customer.id,
      valor,
      status:      "aguardando",
      tipo:        "PIX",
      pix_payload: charge.pixPayload,
      pix_qr_code: charge.pixQrCode,
      vencimento:  charge.dueDate,
    })
    await db.from("profiles").update({ assinatura_status: "pendente" }).eq("id", user.id)
    return { success: true, tipo: "PIX", pixPayload: charge.pixPayload, pixQrCode: charge.pixQrCode, chargeId: charge.chargeId, valor }
  } catch (err: any) {
    return { error: `Erro ao gerar cobrança: ${err.message}` }
  }
}
