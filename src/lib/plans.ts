import { createClient } from '@/lib/supabase/client'

export type PlanRole = 'feirante' | 'organizador'

export interface Plan {
  id: string
  nome: string
  role: PlanRole
  preco_mensal: number
  preco_anual: number
  max_produtos: number | null
  max_feiras: number | null
  max_feirantes: number | null
  features: string[]
  ativo: boolean
}

export interface Assinatura {
  id: string
  plan_id: string
  ciclo: 'mensal' | 'anual'
  status: string
  trial_ends_at: string | null
  vencimento: string | null
  plans: Plan
}

function toError(e: any, prefix: string): Error {
  const msg = e?.message || e?.error_description || JSON.stringify(e)
  return new Error(`${prefix}: ${msg}`)
}

export async function getPlans(role: PlanRole): Promise<Plan[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('role', role)
    .eq('ativo', true)
    .order('preco_mensal', { ascending: true })
  if (error) throw toError(error, 'Erro ao buscar planos')
  return (data ?? []) as Plan[]
}

export async function getUserAssinatura(userId: string): Promise<Assinatura | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('assinaturas')
    .select('*, plans(*)')
    .eq('profile_id', userId)
    .in('status', ['ativo', 'trial', 'aguardando'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw toError(error, 'Erro ao buscar assinatura')
  return data as Assinatura | null
}

export async function getPlanLimits(userId: string) {
  const assinatura = await getUserAssinatura(userId)
  if (!assinatura) {
    return { max_produtos: 5, max_feiras: 0, max_feirantes: 0 }
  }
  const { plans } = assinatura
  return {
    max_produtos: plans.max_produtos,
    max_feiras: plans.max_feiras,
    max_feirantes: plans.max_feirantes,
  }
}

export async function canAddProduct(userId: string): Promise<boolean> {
  const supabase = createClient()
  const limits = await getPlanLimits(userId)
  if (limits.max_produtos === null) return true
  const { count } = await supabase
    .from('servicos')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', userId)
  return (count ?? 0) < limits.max_produtos
}

export async function isOnTrial(userId: string): Promise<boolean> {
  const assinatura = await getUserAssinatura(userId)
  if (!assinatura || !assinatura.trial_ends_at) return false
  return assinatura.status === 'trial' && new Date(assinatura.trial_ends_at) > new Date()
}

export async function createTrialAssinatura(
  userId: string,
  planId: string,
  ciclo: 'mensal' | 'anual' = 'mensal'
) {
  const supabase = createClient()
  const trialEnd = new Date()
  trialEnd.setDate(trialEnd.getDate() + 30)

  const { data, error } = await supabase
    .from('assinaturas')
    .insert({
      profile_id: userId,
      plan_id: planId,
      ciclo,
      status: 'trial',
      trial_ends_at: trialEnd.toISOString(),
    })
    .select()
    .single()

  if (error) throw toError(error, 'Erro ao criar assinatura trial')
  return data
}

export async function completeOnboarding(
  userId: string,
  role: PlanRole,
  planId: string,
  ciclo: 'mensal' | 'anual' = 'mensal'
) {
  const supabase = createClient()

  await createTrialAssinatura(userId, planId, ciclo)

  const { error } = await supabase
    .from('profiles')
    .update({
      onboarding_completo: true,
      assinatura_status: 'trial',
      aprovacao_status: role === 'feirante' ? 'pendente' : 'aprovado',
      roles: [role],
    })
    .eq('id', userId)

  if (error) throw toError(error, 'Erro ao finalizar onboarding')
}
