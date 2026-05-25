const BASE_URL = process.env.ASAAS_BASE_URL
const API_KEY  = process.env.ASAAS_API_KEY

const headers = {
  "Content-Type": "application/json",
  "access_token": API_KEY ?? "",
}

type ClienteParams = {
  nome: string
  email: string
  cpfCnpj: string
}

type CobrancaParams = {
  customerId: string
  valor: number
  descricao: string
  externalReference: string
  vencimentoHoras?: number
}

type AsaasStatus = "PENDING" | "RECEIVED" | "CONFIRMED" | "OVERDUE" | "REFUNDED"

export async function criarOuBuscarCliente(params: ClienteParams) {
  const busca = await fetch(`${BASE_URL}/customers?email=${params.email}`, { headers })
  const { data } = await busca.json()
  if (data?.length > 0) return data[0]
  const res = await fetch(`${BASE_URL}/customers`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name: params.nome, email: params.email, cpfCnpj: params.cpfCnpj }),
  })
  return res.json()
}

export async function gerarCobrancaPix(params: CobrancaParams) {
  const vencimento = new Date()
  vencimento.setHours(vencimento.getHours() + (params.vencimentoHoras ?? 48))
  const dueDate = vencimento.toISOString().split("T")[0]
  const res = await fetch(`${BASE_URL}/payments`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      customer: params.customerId,
      billingType: "PIX",
      value: params.valor,
      dueDate,
      description: params.descricao,
      externalReference: params.externalReference,
    }),
  })
  const charge = await res.json()
  if (!charge.id) throw new Error(`Asaas PIX: ${JSON.stringify(charge)}`)
  const qrRes = await fetch(`${BASE_URL}/payments/${charge.id}/pixQrCode`, { headers })
  const qrData = await qrRes.json()
  return {
    chargeId:   charge.id,
    status:     charge.status as string,
    valor:      charge.value as number,
    dueDate:    charge.dueDate as string,
    pixPayload: qrData.payload as string,
    pixQrCode:  qrData.encodedImage as string,
  }
}

export async function gerarCobrancaBoleto(params: CobrancaParams) {
  const vencimento = new Date()
  vencimento.setHours(vencimento.getHours() + (params.vencimentoHoras ?? 72))
  const dueDate = vencimento.toISOString().split("T")[0]
  const res = await fetch(`${BASE_URL}/payments`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      customer: params.customerId,
      billingType: "BOLETO",
      value: params.valor,
      dueDate,
      description: params.descricao,
      externalReference: params.externalReference,
    }),
  })
  const charge = await res.json()
  if (!charge.id) throw new Error(`Asaas Boleto: ${JSON.stringify(charge)}`)
  return {
    chargeId:     charge.id as string,
    status:       charge.status as string,
    valor:        charge.value as number,
    dueDate:      charge.dueDate as string,
    boletoUrl:    charge.bankSlipUrl as string,
    nossoNumero:  charge.nossoNumero as string | undefined,
  }
}

export async function consultarPagamento(paymentId: string) {
  const res = await fetch(`${BASE_URL}/payments/${paymentId}`, { headers })
  return res.json() as Promise<{
    id: string
    status: AsaasStatus
    value: number
    dueDate: string
    externalReference: string
  }>
}

export function mapAsaasStatus(asaasStatus: AsaasStatus): string {
  const map: Record<AsaasStatus, string> = {
    PENDING:   "aguardando",
    RECEIVED:  "pago",
    CONFIRMED: "pago",
    OVERDUE:   "expirado",
    REFUNDED:  "estornado",
  }
  return map[asaasStatus] ?? "aguardando"
}
