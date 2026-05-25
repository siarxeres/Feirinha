import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"
import { criarOuBuscarCliente } from "@/lib/asaas"
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

  let body: { cpfCnpj: string; nome?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "JSON inválido." }, { status: 400 })
  }

  const cpfCnpj = body.cpfCnpj?.replace(/\D/g, "")
  if (!cpfCnpj || (cpfCnpj.length !== 11 && cpfCnpj.length !== 14)) {
    return Response.json({ error: "CPF ou CNPJ inválido." }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, asaas_customer_id")
    .eq("id", user.id)
    .single()

  const nome = body.nome?.trim() || (profile as any)?.nome || user.email!

  let customer: any
  try {
    customer = await criarOuBuscarCliente({ nome, email: user.email!, cpfCnpj })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 502 })
  }

  if (!customer?.id) {
    return Response.json({ error: "Erro ao criar cliente no Asaas." }, { status: 502 })
  }

  const db = adminDb()
  await db.from("profiles").update({ asaas_customer_id: customer.id, cpf_cnpj: cpfCnpj }).eq("id", user.id)

  return Response.json({ id: customer.id, name: customer.name, email: customer.email })
}
