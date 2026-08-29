import type { SupabaseClient } from "@supabase/supabase-js"
import { dataDeHojeISO } from "./feira-status"

/**
 * Corrige no banco, sob demanda, feiras do organizador cujo data_fim já passou
 * mas que ainda estão "publicada". Chamado no carregamento das telas do
 * organizador em vez de depender de um cron — a primeira visita após o
 * vencimento já corrige o status real gravado em `feiras`.
 */
export async function autoEncerrarFeirasVencidas(supabase: SupabaseClient, organizadorId: string) {
  const { error } = await supabase
    .from("feiras")
    .update({ status: "encerrada" })
    .eq("organizador_id", organizadorId)
    .eq("status", "publicada")
    .lt("data_fim", dataDeHojeISO())

  if (error) {
    console.error("Erro ao auto-encerrar feiras vencidas:", error)
  }
}
