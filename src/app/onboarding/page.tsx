'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { getPlans, completeOnboarding, type Plan, type PlanRole } from '@/lib/plans'

type Step = 1 | 2 | 3 | 4

interface OnboardingState {
  role: PlanRole | null
  q1: string | null
  q2: string | null
  selectedPlanId: string | null
  ciclo: 'mensal' | 'anual'
}

function suggestPlanKey(role: PlanRole, q1: string, q2: string): number {
  if (role === 'feirante') {
    if (q1 === 'Menos de 5') return 0
    if (q1 === 'Mais de 30') return 2
    return 1
  } else {
    if (q1 === 'Mais de 5' || q2 === 'Mais de 100') return 2
    if (q1 === '2 a 5' || q2 === '31 a 100') return 1
    return 0
  }
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [suggestedPlan, setSuggestedPlan] = useState<Plan | null>(null)
  const [plansLoading, setPlansLoading] = useState(false)
  const [plansError, setPlansError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [state, setState] = useState<OnboardingState>({
    role: null, q1: null, q2: null, selectedPlanId: null, ciclo: 'mensal',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      if (!data.user) { router.replace('/auth/login'); return }
      setUserId(data.user.id)
    })
  }, [])

  useEffect(() => {
    if (step === 4 && state.role && state.q1 && state.q2) {
      setPlansLoading(true)
      setPlansError(null)
      getPlans(state.role)
        .then((p: Plan[]) => {
          setPlans(p)
          const idx = suggestPlanKey(state.role!, state.q1!, state.q2!)
          const suggested = p[idx] ?? p[0] ?? null
          setSuggestedPlan(suggested)
          setState(s => ({ ...s, selectedPlanId: suggested?.id ?? null }))
        })
        .catch((err: Error) => {
          console.error(err)
          setPlansError('Não foi possível carregar os planos. Verifique sua conexão e tente novamente.')
        })
        .finally(() => setPlansLoading(false))
    }
  }, [step])

  async function handleConfirm() {
    console.log('[handleConfirm] iniciando', { userId, selectedPlanId: state.selectedPlanId, role: state.role, ciclo: state.ciclo })
    setConfirmError(null)

    // Re-fetch userId on the spot to handle timing edge cases
    let uid = userId
    if (!uid) {
      console.log('[handleConfirm] userId nulo, re-fetching...')
      const { data } = await supabase.auth.getUser()
      uid = data.user?.id ?? null
      if (uid) setUserId(uid)
      console.log('[handleConfirm] re-fetch resultado:', uid)
    }

    if (!uid) {
      const msg = 'Sessão expirada — faça login novamente.'
      console.error('[handleConfirm] userId ausente após re-fetch. Sessão pode ter expirado.')
      // eslint-disable-next-line no-alert
      alert(`[DEBUG onboarding] ${msg}`)
      setConfirmError(msg)
      return
    }
    if (!state.selectedPlanId) {
      const msg = 'Nenhum plano selecionado.'
      console.error('[handleConfirm] selectedPlanId é null. Estado atual:', state)
      // eslint-disable-next-line no-alert
      alert(`[DEBUG onboarding] ${msg}`)
      setConfirmError(msg)
      return
    }
    if (!state.role) {
      const msg = 'Perfil (role) não definido.'
      console.error('[handleConfirm] role é null. Estado atual:', state)
      // eslint-disable-next-line no-alert
      alert(`[DEBUG onboarding] ${msg}`)
      setConfirmError(msg)
      return
    }

    console.log('[handleConfirm] guards ok, chamando completeOnboarding...')
    setLoading(true)
    try {
      await completeOnboarding(uid, state.role, state.selectedPlanId, state.ciclo)
      console.log('[handleConfirm] completeOnboarding ok, chamando router.replace(/dashboard)...')
      router.replace('/dashboard')
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('[handleConfirm] completeOnboarding falhou:', e)
      // eslint-disable-next-line no-alert
      alert(`[DEBUG onboarding] Erro ao confirmar:\n${msg}`)
      setConfirmError(`Erro ao processar: ${msg}`)
      setLoading(false)
    }
  }

  const feiranteQ = [
    { label: 'Quantos produtos você tem?', key: 'q1', opts: ['Menos de 5', '6 a 30', 'Mais de 30'] },
    { label: 'Já usa alguma ferramenta digital?', key: 'q2', opts: ['Não uso nada', 'Só WhatsApp', 'Já tenho loja'] },
  ]
  const organizadorQ = [
    { label: 'Quantas feiras você organiza?', key: 'q1', opts: ['Apenas 1', '2 a 5', 'Mais de 5'] },
    { label: 'Quantos feirantes participam?', key: 'q2', opts: ['Até 30', '31 a 100', 'Mais de 100'] },
  ]
  const questions = state.role === 'organizador' ? organizadorQ : feiranteQ

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* STEP 1 — Boas-vindas */}
        {step === 1 && (
          <div className="text-center animate-fade-in">
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              ✦ Bem-vindo ao Feirinha
            </span>
            <h1 className="font-serif text-4xl font-light leading-tight text-gray-900 mb-4">
              Leve sua feira para o{' '}
              <em className="not-italic text-emerald-600">digital</em>
            </h1>
            <p className="text-gray-500 text-base leading-relaxed max-w-sm mx-auto mb-8">
              Mais visibilidade, mais pedidos, menos trabalho. Tudo que você precisa para crescer está aqui.
            </p>
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8 py-3.5 rounded-full transition-colors"
            >
              Começar agora →
            </button>
            <div className="flex justify-center gap-8 mt-10 pt-8 border-t border-gray-100">
              {[['800+', 'feirantes ativos'], ['120+', 'feiras cadastradas'], ['30 dias', 'grátis para testar']].map(([n, l]) => (
                <div key={l} className="text-center">
                  <div className="font-serif text-2xl font-medium text-emerald-600">{n}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — Identificação */}
        {step === 2 && (
          <div className="animate-fade-in">
            <Dots step={2} />
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Passo 1 de 3</p>
            <h2 className="font-serif text-3xl font-light text-gray-900 mb-6">
              Você é <em className="not-italic text-emerald-600">feirante</em> ou{' '}
              <em className="not-italic text-amber-500">organizador</em>?
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {([
                { key: 'feirante', icon: '🛒', title: 'Feirante', desc: 'Vendo produtos em feiras e quero mais visibilidade' },
                { key: 'organizador', icon: '🎪', title: 'Organizador', desc: 'Organizo feiras e quero gerenciar tudo em um lugar' },
              ] as const).map((r) => (
                <button
                  key={r.key}
                  onClick={() => setState(s => ({ ...s, role: r.key }))}
                  className={`border-2 rounded-2xl p-5 text-left transition-all ${
                    state.role === r.key
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-100 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-2xl block mb-2">{r.icon}</span>
                  <p className="font-medium text-gray-900 text-sm mb-1">{r.title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{r.desc}</p>
                </button>
              ))}
            </div>
            <NavRow
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              nextDisabled={!state.role}
            />
          </div>
        )}

        {/* STEP 3 — Necessidades */}
        {step === 3 && (
          <div className="animate-fade-in">
            <Dots step={3} />
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Passo 2 de 3</p>
            <h2 className="font-serif text-3xl font-light text-gray-900 mb-6">
              Conta um pouco sobre{' '}
              <em className="not-italic text-emerald-600">você</em>
            </h2>
            <div className="space-y-5 mb-6">
              {questions.map((q) => (
                <div key={q.key}>
                  <p className="text-sm font-medium text-gray-700 mb-2.5">{q.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {q.opts.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setState(s => ({ ...s, [q.key]: opt }))}
                        className={`border rounded-full px-4 py-1.5 text-sm transition-all ${
                          state[q.key as 'q1' | 'q2'] === opt
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-medium'
                            : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <NavRow
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
              nextDisabled={!state.q1 || !state.q2}
              nextLabel="Ver meu plano ideal ✦"
            />
          </div>
        )}

        {/* STEP 4 — Sugestão de plano */}
        {step === 4 && (
          <div className="animate-fade-in">
            <Dots step={4} />
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Passo 3 de 3</p>
            <h2 className="font-serif text-3xl font-light text-gray-900 mb-5">
              Seu plano <em className="not-italic text-emerald-600">ideal</em>
            </h2>

            {plansLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Buscando planos...</p>
              </div>
            )}

            {plansError && !plansLoading && (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center mb-4">
                <p className="text-sm text-red-700 mb-4">{plansError}</p>
                <button
                  onClick={() => setStep(3)}
                  className="text-sm font-medium text-red-600 hover:text-red-800 underline"
                >
                  ← Voltar e tentar novamente
                </button>
              </div>
            )}

            {!plansLoading && !plansError && plans.length === 0 && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-center mb-4">
                <p className="text-sm text-amber-700 mb-4">Nenhum plano encontrado para o perfil selecionado.</p>
                <button
                  onClick={() => setStep(2)}
                  className="text-sm font-medium text-amber-600 hover:text-amber-800 underline"
                >
                  ← Revisar perfil
                </button>
              </div>
            )}

            {/* Ciclo */}
            {!plansLoading && !plansError && plans.length > 0 && (
            <div className="inline-flex border border-gray-200 rounded-full p-1 mb-4">
              {(['mensal', 'anual'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setState(s => ({ ...s, ciclo: c }))}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    state.ciclo === c ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {c === 'mensal' ? 'Mensal' : 'Anual −20%'}
                </button>
              ))}
            </div>
            )}

            {!plansLoading && !plansError && suggestedPlan && (
              <div className="border-2 border-emerald-500 rounded-2xl p-5 mb-3 relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-medium px-4 py-1 rounded-full whitespace-nowrap">
                  Recomendado para você
                </span>
                <h3 className="font-serif text-xl font-medium text-gray-900 mt-1 mb-1">{suggestedPlan.nome}</h3>
                <p className="text-3xl font-medium text-emerald-600 mb-3">
                  {state.ciclo === 'mensal'
                    ? `R$${suggestedPlan.preco_mensal?.toFixed(2).replace('.', ',')}`
                    : `R$${suggestedPlan.preco_anual?.toFixed(2).replace('.', ',')}`}
                  <span className="text-sm text-gray-400 font-normal">/mês</span>
                </p>
                <ul className="space-y-1.5 mb-4">
                  {(suggestedPlan.features as string[]).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-emerald-500 text-base">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium py-3 rounded-full transition-colors"
                >
                  {loading ? 'Processando...' : 'Assinar agora — 30 dias grátis'}
                </button>
                {confirmError && (
                  <p className="text-sm text-red-600 text-center mt-3 leading-snug">{confirmError}</p>
                )}
                <p className="text-center text-xs text-gray-400 mt-2">
                  ✦ Sem cobrança nos primeiros 30 dias. Cancele quando quiser.
                </p>
              </div>
            )}

            {/* Planos alternativos */}
            {plans.filter(p => p.id !== suggestedPlan?.id).length > 0 && (
              <>
                <p className="text-xs text-center text-gray-400 mb-2">Ou explore outras opções:</p>
                <div className="grid grid-cols-2 gap-2">
                  {plans.filter(p => p.id !== suggestedPlan?.id).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSuggestedPlan(p)
                        setState(s => ({ ...s, selectedPlanId: p.id }))
                      }}
                      className="border border-gray-100 rounded-xl p-3 text-left hover:border-emerald-300 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-700">{p.nome}</p>
                      <p className="text-xs text-gray-400">
                        R${(state.ciclo === 'mensal' ? p.preco_mensal : p.preco_anual)?.toFixed(2).replace('.', ',')}/mês
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="text-center mt-4">
              <button onClick={() => setStep(3)} className="text-sm text-gray-400 hover:text-gray-600">
                ← Refazer perguntas
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function Dots({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 mb-5">
      {[2, 3, 4, 5].map((s, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            s < step ? 'w-4 bg-emerald-400' :
            s === step ? 'w-6 bg-emerald-600' :
            'w-1.5 bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

function NavRow({
  onBack, onNext, nextDisabled, nextLabel = 'Continuar →'
}: {
  onBack: () => void
  onNext: () => void
  nextDisabled?: boolean
  nextLabel?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
        ← Voltar
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-full text-sm transition-colors"
      >
        {nextLabel}
      </button>
    </div>
  )
}
