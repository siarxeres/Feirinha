"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { iniciarAssinatura } from "./actions"
import {
  CheckCircle2, Clock, AlertTriangle, Copy, Check, ExternalLink, CreditCard,
} from "lucide-react"

type PagamentoPendente = {
  tipo: "PIX" | "BOLETO"
  pixPayload?: string | null
  pixQrCode?: string | null
  boletoUrl?: string | null
  valor: number
}

interface Props {
  status: string
  expiraEm: string | null
  cpfCnpj: string | null
  pagamentoPendente: PagamentoPendente | null
}

const BENEFICIOS = [
  "Inscrição em feiras ilimitadas",
  "Perfil de feirante completo",
  "Acesso ao mapa de feiras",
]

export function AssinaturaClient({ status, expiraEm, cpfCnpj, pagamentoPendente }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [cpf, setCpf] = useState(cpfCnpj ?? "")
  const [tipo, setTipo] = useState<"PIX" | "BOLETO">("PIX")
  const [cobranca, setCobranca] = useState<PagamentoPendente | null>(pagamentoPendente)
  const [error, setError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  const handleGerar = () => {
    setError(null)
    startTransition(async () => {
      const result = await iniciarAssinatura(cpf, tipo)
      if ("error" in result) {
        setError(result.error)
        return
      }
      if (result.tipo === "PIX") {
        setCobranca({ tipo: "PIX", pixPayload: result.pixPayload, pixQrCode: result.pixQrCode, valor: result.valor })
      } else {
        setCobranca({ tipo: "BOLETO", boletoUrl: result.boletoUrl, valor: result.valor })
      }
      router.refresh()
    })
  }

  const copiar = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      const el = document.createElement("textarea")
      el.value = texto
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
    }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  // ── Assinatura ativa ──────────────────────────────────────────
  if (status === "ativa") {
    const expira = expiraEm
      ? new Date(expiraEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
      : null
    return (
      <div className="space-y-4">
        <div
          className="rounded-2xl p-5 flex items-start gap-4"
          style={{ background: "#f0fdf4", border: "2px solid #bbf7d0" }}
        >
          <CheckCircle2 size={26} className="text-green-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-green-800 text-base">Assinatura Ativa</p>
            {expira && <p className="text-sm text-green-700 mt-1">Válida até {expira}</p>}
          </div>
        </div>
        <div
          className="bg-white rounded-2xl p-5 shadow-sm"
          style={{ border: "2px solid #e5e7eb" }}
        >
          <p className="text-sm font-semibold text-gray-700 mb-3">Incluído no seu plano:</p>
          <ul className="space-y-2.5">
            {BENEFICIOS.map(b => (
              <li key={b} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  // ── Cobrança PIX pendente ─────────────────────────────────────
  if (cobranca?.tipo === "PIX" && cobranca.pixPayload) {
    return (
      <div className="space-y-4">
        <div
          className="rounded-2xl p-5 flex items-start gap-4"
          style={{ background: "#fffbeb", border: "2px solid #fde68a" }}
        >
          <Clock size={24} className="text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-yellow-800">Aguardando Pagamento</p>
            <p className="text-sm text-yellow-700 mt-0.5">
              PIX · R$ {Number(cobranca.valor).toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>

        <div
          className="bg-white rounded-2xl p-5 flex flex-col items-center gap-4"
          style={{ border: "2px solid #e5e7eb" }}
        >
          {cobranca.pixQrCode && (
            <img
              src={`data:image/png;base64,${cobranca.pixQrCode}`}
              alt="QR Code PIX"
              className="w-52 h-52 rounded-xl"
            />
          )}

          <div className="w-full">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Pix Copia e Cola
            </p>
            <div className="flex items-center gap-2">
              <p className="flex-1 text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2 font-mono break-all line-clamp-3">
                {cobranca.pixPayload}
              </p>
              <button
                onClick={() => copiar(cobranca.pixPayload!)}
                className="shrink-0 p-2.5 rounded-xl text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#E8560A" }}
                aria-label="Copiar código PIX"
              >
                {copiado ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            {copiado && <p className="text-xs text-green-600 mt-1.5 text-center">Código copiado!</p>}
          </div>

          <p className="text-xs text-gray-400 text-center leading-relaxed">
            Após o pagamento, sua assinatura é ativada automaticamente.
          </p>
        </div>
      </div>
    )
  }

  // ── Cobrança boleto pendente ──────────────────────────────────
  if (cobranca?.tipo === "BOLETO" && cobranca.boletoUrl) {
    return (
      <div className="space-y-4">
        <div
          className="rounded-2xl p-5 flex items-start gap-4"
          style={{ background: "#fffbeb", border: "2px solid #fde68a" }}
        >
          <Clock size={24} className="text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-yellow-800">Aguardando Pagamento</p>
            <p className="text-sm text-yellow-700 mt-0.5">
              Boleto · R$ {Number(cobranca.valor).toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>
        <div
          className="bg-white rounded-2xl p-5"
          style={{ border: "2px solid #e5e7eb" }}
        >
          <a
            href={cobranca.boletoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#E8560A" }}
          >
            <ExternalLink size={16} />
            Abrir Boleto
          </a>
          <p className="text-xs text-gray-400 text-center mt-3 leading-relaxed">
            Após o pagamento, sua assinatura é ativada automaticamente.
          </p>
        </div>
      </div>
    )
  }

  // ── Formulário de adesão / renovação ─────────────────────────
  return (
    <div className="space-y-4">
      {status === "suspensa" && (
        <div
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background: "#fef2f2", border: "2px solid #fecaca" }}
        >
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Assinatura Suspensa</p>
            <p className="text-xs text-red-700 mt-0.5">
              Renove para continuar se inscrevendo em feiras.
            </p>
          </div>
        </div>
      )}

      <div
        className="bg-white rounded-2xl p-5 shadow-sm"
        style={{ border: "2px solid #e5e7eb" }}
      >
        {/* Preço */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-base font-bold text-gray-900">Plano Mensal</p>
            <p className="text-xs text-gray-500 mt-0.5">Cancele quando quiser</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-gray-900">R$&nbsp;29,90</span>
            <span className="text-sm text-gray-500">/mês</span>
          </div>
        </div>

        {/* Benefícios */}
        <ul className="space-y-2 mb-5">
          {BENEFICIOS.map(b => (
            <li key={b} className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 size={13} className="text-green-500 shrink-0" />
              {b}
            </li>
          ))}
        </ul>

        {/* Formulário */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              CPF ou CNPJ
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={cpf}
              onChange={e => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#E8560A]/30 focus:border-[#E8560A] transition"
              style={{ borderColor: error ? "#ef4444" : "#e5e7eb" }}
              disabled={isPending}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Forma de pagamento
            </label>
            <div className="mt-1.5 flex gap-2">
              {(["PIX", "BOLETO"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors"
                  style={
                    tipo === t
                      ? { borderColor: "#E8560A", backgroundColor: "#fff7ed", color: "#E8560A" }
                      : { borderColor: "#e5e7eb", backgroundColor: "white", color: "#6b7280" }
                  }
                >
                  {t === "PIX" ? "PIX" : "Boleto"}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1.5">
              <AlertTriangle size={12} className="shrink-0" />
              {error}
            </p>
          )}

          <button
            onClick={handleGerar}
            disabled={isPending || !cpf.trim()}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: "#E8560A" }}
          >
            <CreditCard size={16} />
            {isPending ? "Gerando cobrança..." : "Gerar Cobrança"}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Sandbox Asaas — nenhum valor real será cobrado.
          </p>
        </div>
      </div>
    </div>
  )
}
