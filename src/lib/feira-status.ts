export type FeiraStatusExibicao = "rascunho" | "publicada" | "encerrada"

export const FEIRA_STATUS_LABEL: Record<FeiraStatusExibicao, string> = {
  rascunho: "Rascunho",
  publicada: "Publicada",
  encerrada: "Encerrada",
}

export const FEIRA_STATUS_BADGE_CLASS: Record<FeiraStatusExibicao, string> = {
  publicada: "bg-green-100 text-green-700",
  rascunho: "bg-slate-100 text-slate-700",
  encerrada: "bg-red-100 text-red-700",
}

/**
 * Uma feira "publicada" é considerada encerrada assim que o dia de data_fim
 * termina — status calculado em tempo de renderização, nunca gravado no banco.
 */
export function isFeiraEncerradaPorData(dataFim: string | null | undefined): boolean {
  if (!dataFim) return false
  return new Date(`${dataFim}T23:59:59`).getTime() < Date.now()
}

export function resolveFeiraStatusExibicao(
  status: string | null | undefined,
  dataFim: string | null | undefined
): FeiraStatusExibicao {
  if (status === "publicada" && isFeiraEncerradaPorData(dataFim)) return "encerrada"
  return (status as FeiraStatusExibicao) ?? "rascunho"
}

/** Data de hoje em YYYY-MM-DD, para filtrar feiras cujo data_fim ainda não passou. */
export function dataDeHojeISO(): string {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, "0")
  const dia = String(hoje.getDate()).padStart(2, "0")
  return `${ano}-${mes}-${dia}`
}
