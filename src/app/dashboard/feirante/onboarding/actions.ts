"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { iniciarAssinatura } from "@/app/dashboard/feirante/assinatura/actions"

function adminDb() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function salvarDadosPessoais(formData: {
  nome: string
  cpf_cnpj: string
}): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const limpo = formData.cpf_cnpj.replace(/\D/g, "")
  if (limpo.length !== 11 && limpo.length !== 14) {
    return { error: "CPF ou CNPJ inválido. Digite apenas os números." }
  }

  const db = adminDb()
  const { error } = await db
    .from("profiles")
    .update({ nome: formData.nome.trim(), cpf_cnpj: limpo })
    .eq("id", user.id)

  if (error) return { error: "Erro ao salvar dados. Tente novamente." }
  return { success: true }
}

export async function iniciarPagamentoOnboarding(
  cpfCnpj: string,
  tipo: "PIX" | "BOLETO"
): Promise<
  | { success: true; tipo: "PIX"; pixPayload: string; pixQrCode: string; chargeId: string; valor: number }
  | { success: true; tipo: "BOLETO"; boletoUrl: string; chargeId: string; valor: number }
  | { error: string }
> {
  const result = await iniciarAssinatura(cpfCnpj, tipo)
  if ("error" in result) return result

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const db = adminDb()
  await db
    .from("profiles")
    .update({ aprovacao_status: "aguardando_aprovacao" })
    .eq("id", user.id)

  return result
}
