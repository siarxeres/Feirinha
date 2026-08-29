import type { SupabaseClient } from "@supabase/supabase-js"

export type NotificacaoTipo =
  | "inscricao_aprovada"
  | "inscricao_rejeitada"
  | "pagamento_confirmado"
  | "pagamento_expirado"
  | "comunicado"
  | "lembrete"
  | "lista_espera"

type NovaNotificacao = {
  userId: string
  tipo: NotificacaoTipo
  titulo: string
  mensagem: string
  payload?: Record<string, unknown>
}

/**
 * Cria uma notificação. Nunca lança erro — uma falha aqui (ex: GRANT pendente
 * na tabela notificacoes) não pode derrubar a ação principal (aprovar,
 * rejeitar, enviar comunicado).
 */
export async function criarNotificacao(supabase: SupabaseClient, item: NovaNotificacao) {
  const { error } = await supabase.from("notificacoes").insert({
    user_id: item.userId,
    tipo: item.tipo,
    titulo: item.titulo,
    mensagem: item.mensagem,
    payload: item.payload ?? null,
  })

  if (error) {
    console.error("Erro ao criar notificação:", error)
  }
}

/** Mesma garantia de não lançar erro, para notificar vários usuários de uma vez (ex: comunicado). */
export async function criarNotificacoes(supabase: SupabaseClient, itens: NovaNotificacao[]) {
  if (itens.length === 0) return

  const { error } = await supabase.from("notificacoes").insert(
    itens.map((item) => ({
      user_id: item.userId,
      tipo: item.tipo,
      titulo: item.titulo,
      mensagem: item.mensagem,
      payload: item.payload ?? null,
    }))
  )

  if (error) {
    console.error("Erro ao criar notificações em lote:", error)
  }
}
