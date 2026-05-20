import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BarracaGrid } from './BarracaGrid'

export default async function FeiraDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: feira } = await supabase
    .from('feiras')
    .select('*')
    .eq('id', id)
    .single()

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: barracas, error } = await adminClient
    .from('barracas')
    .select('*')
    .eq('feira_id', id)
    .order('numero', { ascending: true })

  const { data: inscricoes } = await adminClient
    .from('inscricoes')
    .select('*, profiles(*)')
    .eq('feira_id', id)
    .eq('status', 'pendente')

  console.log('[DEBUG] SERVICE_KEY existe:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.log('[DEBUG] barracas:', barracas?.length, '| erro:', error?.message)

  const total = barracas?.length ?? 0
  const ocupadas = barracas?.filter(b => b.status === 'ocupada').length ?? 0
  const livres = barracas?.filter(b => b.status === 'livre').length ?? 0
  const barracasComPendente = new Set(inscricoes?.map(i => i.barraca_id).filter(Boolean))
  const pendentes = barracas?.filter(b => barracasComPendente.has(b.id)).length ?? 0

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Link href="/dashboard/organizador" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">← Dashboard</Link>

      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{feira?.nome}</h1>
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{feira?.status}</span>
        </div>
        <p className="text-gray-500 text-sm">{feira?.cidade}, {feira?.estado} · {feira?.data_inicio?.slice(0,10)} – {feira?.data_fim?.slice(0,10)}</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'TOTAL DE BARRACAS', value: total, color: 'text-orange-500' },
          { label: 'OCUPADAS', value: ocupadas, color: 'text-green-500' },
          { label: 'LIVRES', value: livres, color: 'text-blue-500' },
          { label: 'PENDENTES', value: pendentes, color: 'text-yellow-500' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-400 font-semibold mb-2">{card.label}</p>
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Mapa de Barracas</h2>
        {!barracas || barracas.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Nenhuma barraca cadastrada para esta feira.</p>
        ) : (
          <BarracaGrid barracas={barracas} inscricoes={inscricoes ?? []} />
        )}
        <div className="flex gap-4 mt-6 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border-2 border-gray-300 inline-block"></span>Livre</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>Pendente</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span>Aprovado</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>Rejeitado</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-400 inline-block"></span>Bloqueado</span>
        </div>
      </div>
    </div>
  )
}
