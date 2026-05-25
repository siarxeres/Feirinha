"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

function adminDb() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function verificarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const { data: profile } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .single()
  if (!(profile as any)?.roles?.includes("admin")) redirect("/dashboard")
}

export async function aprovarFeirante(feiranteId: string): Promise<{ error?: string }> {
  await verificarAdmin()
  const db = adminDb()
  const { error } = await db
    .from("profiles")
    .update({ aprovacao_status: "aprovado" })
    .eq("id", feiranteId)
  if (error) return { error: "Erro ao aprovar feirante." }
  revalidatePath("/dashboard/admin/usuarios")
  return {}
}

export async function rejeitarFeirante(feiranteId: string): Promise<{ error?: string }> {
  await verificarAdmin()
  const db = adminDb()
  const { error } = await db
    .from("profiles")
    .update({ aprovacao_status: "rejeitado" })
    .eq("id", feiranteId)
  if (error) return { error: "Erro ao rejeitar feirante." }
  revalidatePath("/dashboard/admin/usuarios")
  return {}
}
