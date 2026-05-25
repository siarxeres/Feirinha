"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2, CreditCard, User, ArrowRight, Copy, Check,
  ExternalLink, AlertTriangle, Clock, Store,
} from "lucide-react"
import { salvarDadosPessoais, iniciarPagamentoOnboarding } from "./actions"

type CobrancaData =
  | { tipo: "PIX"; pixPayload: string; pixQrCode: string | null; valor: number }
  | { tipo: "BOLETO"; boletoUrl: string; valor: number }

interface Props {
  initialNome: string
  initialCpfCnpj: string | null
  initialCobranca: CobrancaData | null
  initialStep: 1 | 2 | 3 | 4
}

const BENEFICIOS = [
  "Inscrição em feiras ilimitadas",
  "Perfil de feirante completo",
  "Acesso ao mapa de feiras",
]

const STEPS = [
  { label: "Dados", icon: User },
  { label: "Plano", icon: Store },
  { label: "Pagamento", icon: CreditCard },
  { label: "Enviado", icon: CheckCircle2 },
]

export function OnboardingClient({ initialNome, initialCpfCnpj, initialCobranca, initialStep }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(initialStep)
  const [nome, setNome] = useState(initialNome)
  const [cpfCnpj, setCpfCnpj] = useState(initialCpfCnpj ?? "")
  const [tipo, setTipo] = useState<"PIX" | "BOLETO">("PIX")
  const [cobranca, setCobranca] = useState<CobrancaData | null>(initialCobranca)
  const [error, setError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

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

  // ── Step 1: Dados Pessoais ─────────────────────────────────────
  const handleStep1 = () => {
    if (!nome.trim()) { setError("Informe seu nome completo."); return }
    if (!cpfCnpj.trim()) { setError("Informe seu CPF ou CNPJ."); return }
    setError(null)
    startTransition(async () => {
      const result = await salvarDadosPessoais({ nome, cpf_cnpj: cpfCnpj })
      if (result.error) { setError(result.error); return }
      setStep(2)
    })
  }

  // ── Step 3: Pagamento ─────────────────────────────────────────
  const handleGerar = () => {
    setError(null)
    startTransition(async () => {
      const result = await iniciarPagamentoOnboarding(cpfCnpj, tipo)
      if ("error" in result) { setError(result.error); return }
      if (result.tipo === "PIX") {
        setCobranca({ tipo: "PIX", pixPayload: result.pixPayload, pixQrCode: result.pixQrCode, valor: result.valor })
      } else {
        setCobranca({ tipo: "BOLETO", boletoUrl: result.boletoUrl, valor: result.valor })
      }
      setStep(4)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen flex flex-col px-5 pt-12 pb-10">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <img src="/feirinha-logo.svg" alt="Feirinha" width={36} height={36} />
          <span className="text-lg font-bold tracking-tight text-gray-900">Feirinhas</span>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const n = i + 1
              const done = step > n
              const active = step === n
              const Icon = s.icon
              return (
                <div key={s.label} className="flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                    style={
                      done
                        ? { backgroundColor: "#1D9E75", color: "white" }
                        : active
                        ? { backgroundColor: "#E8560A", color: "white" }
                        : { backgroundColor: "#e5e7eb", color: "#9ca3af" }
                    }
                  >
                    {done ? <CheckCircle2 size={18} /> : <Icon size={16} />}
                  </div>
                  <span className={`text-xs font-medium ${active ? "text-gray-900" : done ? "text-[#1D9E75]" : "text-gray-400"}`}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
          {/* connector line */}
          <div className="relative h-1 bg-gray-200 rounded-full mt-1 mx-5">
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / 3) * 100}%`, backgroundColor: "#E8560A" }}
            />
          </div>
        </div>

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="flex-1 space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dados pessoais</h1>
              <p className="text-sm text-gray-500 mt-1">Como você será identificado nas feiras.</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Nome completo
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Seu nome ou nome da empresa"
                  disabled={isPending}
                  className="w-full px-3.5 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#E8560A]/30 focus:border-[#E8560A] transition disabled:opacity-60"
                  style={{ borderColor: "#e5e7eb" }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  CPF ou CNPJ
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cpfCnpj}
                  onChange={e => setCpfCnpj(e.target.value)}
                  placeholder="000.000.000-00 ou 00.000.000/0001-00"
                  disabled={isPending}
                  className="w-full px-3.5 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#E8560A]/30 focus:border-[#E8560A] transition disabled:opacity-60"
                  style={{ borderColor: error ? "#ef4444" : "#e5e7eb" }}
                />
                <p className="text-xs text-gray-400">Necessário para emissão da cobrança.</p>
              </div>

              {error && (
                <p className="text-xs text-red-500 flex items-center gap-1.5">
                  <AlertTriangle size={12} className="shrink-0" />
                  {error}
                </p>
              )}
            </div>

            <button
              onClick={handleStep1}
              disabled={isPending}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#E8560A" }}
            >
              {isPending ? "Salvando..." : <>Continuar <ArrowRight size={16} /></>}
            </button>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="flex-1 space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Escolha seu plano</h1>
              <p className="text-sm text-gray-500 mt-1">Acesso completo para feirantes.</p>
            </div>

            <div
              className="bg-white rounded-2xl p-5 shadow-sm"
              style={{ border: "2px solid #E8560A" }}
            >
              <div className="flex items-end justify-between mb-4">
                <div>
                  <div
                    className="text-xs font-bold px-2.5 py-1 rounded-full mb-2 inline-block"
                    style={{ backgroundColor: "#fff7ed", color: "#E8560A" }}
                  >
                    Plano único
                  </div>
                  <p className="text-lg font-bold text-gray-900">Plano Mensal</p>
                  <p className="text-xs text-gray-500">Cancele quando quiser</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-gray-900">R$&nbsp;29,90</span>
                  <span className="text-sm text-gray-500">/mês</span>
                </div>
              </div>

              <ul className="space-y-3 mb-5">
                {BENEFICIOS.map(b => (
                  <li key={b} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 size={15} className="text-[#1D9E75] shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#E8560A" }}
            >
              Escolher este plano <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <div className="flex-1 space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pagamento</h1>
              <p className="text-sm text-gray-500 mt-1">Escolha como pagar sua assinatura.</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-end justify-between pb-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">Plano Mensal</p>
                <p className="text-xl font-bold text-gray-900">R$&nbsp;29,90</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  CPF ou CNPJ
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cpfCnpj}
                  onChange={e => setCpfCnpj(e.target.value)}
                  disabled={isPending}
                  className="w-full px-3.5 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#E8560A]/30 focus:border-[#E8560A] transition disabled:opacity-60"
                  style={{ borderColor: "#e5e7eb" }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Forma de pagamento
                </label>
                <div className="flex gap-2">
                  {(["PIX", "BOLETO"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTipo(t)}
                      disabled={isPending}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-colors"
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
            </div>

            <button
              onClick={handleGerar}
              disabled={isPending || !cpfCnpj.trim()}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#E8560A" }}
            >
              <CreditCard size={16} />
              {isPending ? "Gerando cobrança..." : "Gerar Cobrança"}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Sandbox Asaas — nenhum valor real será cobrado.
            </p>
          </div>
        )}

        {/* ── Step 4 ── */}
        {step === 4 && cobranca && (
          <div className="flex-1 space-y-5">
            <div
              className="rounded-2xl p-5 flex items-start gap-4"
              style={{ background: "#fffbeb", border: "2px solid #fde68a" }}
            >
              <Clock size={24} className="text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-yellow-800">Aguardando Pagamento</p>
                <p className="text-sm text-yellow-700 mt-0.5">
                  {cobranca.tipo} · R$ {Number(cobranca.valor).toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>

            {cobranca.tipo === "PIX" && cobranca.pixPayload && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col items-center gap-4">
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
                      onClick={() => copiar((cobranca as any).pixPayload!)}
                      className="shrink-0 p-2.5 rounded-xl text-white"
                      style={{ backgroundColor: "#E8560A" }}
                    >
                      {copiado ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  {copiado && <p className="text-xs text-green-600 mt-1.5 text-center">Código copiado!</p>}
                </div>
              </div>
            )}

            {cobranca.tipo === "BOLETO" && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <a
                  href={(cobranca as any).boletoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: "#E8560A" }}
                >
                  <ExternalLink size={16} />
                  Abrir Boleto
                </a>
              </div>
            )}

            <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#1D9E75] shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  Após o pagamento, sua conta será revisada pela nossa equipe. Você receberá acesso em breve.
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard/feirante")}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#1D9E75" }}
            >
              Ir para o painel <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
