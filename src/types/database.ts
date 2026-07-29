// Gerado automaticamente pelo Supabase CLI:
//   npx supabase gen types typescript --project-id gmtfebfazptpmnnfiygh > src/types/database.ts
//
// Este stub mantém o build funcionando. Substitua pelo arquivo gerado para
// ter autocomplete e type-safety completos nas queries do Supabase.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = { Row: any; Insert: any; Update: any }

export type Database = {
  public: {
    Tables: {
      profiles:         AnyRow
      categorias:       AnyRow
      feiras:           AnyRow
      barracas:         AnyRow
      inscricoes:       AnyRow
      pagamentos:       AnyRow
      notificacoes:     AnyRow
      comunicados:      AnyRow
      favoritos:        AnyRow
      servicos:         AnyRow
      assinaturas:      AnyRow
      perfis_feirantes: AnyRow
      pedidos_servicos: AnyRow
      itens_pedido:     AnyRow
      despesas_feira:   AnyRow
    }
    Views: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vw_resumo_feira:    { Row: any }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vw_feiras_publicas: { Row: any }
    }
    Functions: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gerar_barracas:         { Args: any; Returns: any }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      aprovar_inscricao:      { Args: any; Returns: any }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      proxima_posicao_espera: { Args: any; Returns: any }
    }
    Enums: Record<string, never>
  }
}
