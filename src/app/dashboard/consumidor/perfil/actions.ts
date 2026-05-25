"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

function adminDb() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function atualizarPerfil(
  nome: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const nomeTrimmed = nome.trim()
  if (!nomeTrimmed) return { error: "Nome não pode ser vazio." }
  if (nomeTrimmed.length > 100) return { error: "Nome muito longo." }

  const { error } = await adminDb()
    .from("profiles")
    .update({ nome: nomeTrimmed })
    .eq("id", user.id)

  if (error) return { error: error.message }
  return { success: true }
}
