import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { FeiraDetalheClient } from './_components/FeiraDetalheClient'

export default async function FeiraDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const [{ data: feira }, { data: barracas }, { data: inscricoes }] = await Promise.all([
    supabase.from('feiras').select('*').eq('id', id).single(),
    adminClient.from('barracas').select('*').eq('feira_id', id).order('numero', { ascending: true }),
    adminClient.from('inscricoes').select('*, profiles(*)').eq('feira_id', id).order('created_at', { ascending: false }),
  ])

  return (
    <FeiraDetalheClient
      feiraId={id}
      feira={feira}
      barracas={barracas ?? []}
      inscricoes={inscricoes ?? []}
    />
  )
}
