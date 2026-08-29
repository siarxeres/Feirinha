"use server"

import { createClient } from "@/lib/supabase/server"

export async function marcarNotificacoesComoLidas(ids: string[]) {
  if (ids.length === 0) return { success: true }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Sessão expirada. Faça login novamente." }

  const { error } = await supabase
    .from("notificacoes")
    .update({ lida: true })
    .in("id", ids)
    .eq("user_id", user.id)

  if (error) return { error: error.message }
  return { success: true }
}
