import { createAdminClient } from "@/lib/supabase/server"

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
 * Cria uma notificação. Usa a service role (bypassa a RLS notificacoes_own,
 * que restringe auth.uid() = user_id) porque quem grava aqui é o organizador
 * notificando o feirante — não o próprio dono da notificação. A autorização
 * de quem pode disparar cada notificação já foi checada antes, na action que
 * chama esta função (ex: só o organizador dono da feira aprova/rejeita
 * inscrição ou envia comunicado).
 *
 * Nunca lança erro — uma falha aqui não pode derrubar a ação principal
 * (aprovar, rejeitar, enviar comunicado).
 */
export async function criarNotificacao(item: NovaNotificacao) {
  const admin = createAdminClient()
  const { error } = await admin.from("notificacoes").insert({
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
export async function criarNotificacoes(itens: NovaNotificacao[]) {
  if (itens.length === 0) return

  const admin = createAdminClient()
  const { error } = await admin.from("notificacoes").insert(
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
