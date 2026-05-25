"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const { data: profile } = await supabase.from("profiles").select("roles").eq("id", user.id).single()
  if (!(profile as any)?.roles?.includes("admin")) redirect("/dashboard")
}

function adminDb() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

type ServicoData = {
  nome: string
  descricao: string | null
  categoria: string
  ativo: boolean
}

export async function criarServico(data: ServicoData): Promise<{ success: true } | { error: string }> {
  await checkAdmin()
  const db = adminDb()
  const { error } = await db.from("servicos").insert({
    nome: data.nome.trim(),
    descricao: data.descricao || null,
    categoria: data.categoria,
    ativo: data.ativo,
    feira_id: null,
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function editarServico(id: string, data: ServicoData): Promise<{ success: true } | { error: string }> {
  await checkAdmin()
  const db = adminDb()
  const { error } = await db.from("servicos").update({
    nome: data.nome.trim(),
    descricao: data.descricao || null,
    categoria: data.categoria,
    ativo: data.ativo,
  }).eq("id", id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function excluirServico(id: string): Promise<{ success: true } | { error: string }> {
  await checkAdmin()
  const db = adminDb()
  const { error } = await db.from("servicos").delete().eq("id", id)
  if (error) return { error: error.message }
  return { success: true }
}
