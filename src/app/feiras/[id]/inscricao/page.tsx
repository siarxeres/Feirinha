import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { MapPin, CalendarDays, Store } from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/app/dashboard/feirante/_components/BottomNav'
import { InscricaoClient } from './InscricaoClient'

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default async function InscricaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: feira }, { data: inscricaoExistente }, { data: despesas }, { count: inscritosCount }] = await Promise.all([
    supabase
      .from('feiras')
      .select('id, nome, cidade, estado, data_inicio, data_fim, categorias')
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('inscricoes')
      .select('id, status')
      .eq('feirante_id', user.id)
      .eq('feira_id', id)
      .maybeSingle(),
    supabase
      .from('despesas_feira')
      .select('id, categoria, descricao, valor')
      .eq('feira_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('inscricoes')
      .select('id', { count: 'exact', head: true })
      .eq('feira_id', id)
      .in('status', ['aprovado', 'aprovada']),
  ])

  if (!feira) notFound()

  const categorias: string[] = Array.isArray(feira.categorias) ? feira.categorias : []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">

        <header className="px-5 pt-12 pb-5">
          <div className="flex items-center gap-2 mb-5">
            <img src="/feirinha-logo.svg" alt="Feirinha" width={36} height={36} />
            <span className="text-lg font-bold tracking-tight text-gray-900">Feirinha</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/feirante"
              className="text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              ← Voltar
            </Link>
            <h1 className="text-3xl font-bold text-foreground">
              Inscrição
            </h1>
          </div>
        </header>

        <div className="flex-1 px-5 pb-28 space-y-4">

          {/* Feira card */}
          <div
            className="rounded-2xl bg-white shadow-sm overflow-hidden border-2 border-gray-200"
          >
            <div
              className="h-16 flex items-center justify-center bg-gradient-to-br from-primary to-orange-400"
            >
              <Store size={28} className="text-white opacity-80" />
            </div>
            <div className="px-4 pt-3 pb-4">
              <p className="text-base font-bold text-gray-900 mb-2">{feira.nome}</p>
              <div className="flex flex-col gap-1">
                {feira.cidade && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin size={12} />
                    {feira.cidade}, {feira.estado}
                  </span>
                )}
                {feira.data_inicio && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <CalendarDays size={12} />
                    {formatDate(feira.data_inicio)} – {formatDate(feira.data_fim)}
                  </span>
                )}
              </div>
              {categorias.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {categorias.map((cat: string) => (
                    <span
                      key={cat}
                      className="text-xs px-2 py-0.5 rounded-full capitalize bg-primary/10 text-primary border border-primary/20"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Inscription action area */}
          <InscricaoClient
            feiraId={id}
            jaInscrito={!!inscricaoExistente}
            statusAtual={inscricaoExistente?.status ?? null}
            despesas={despesas ?? []}
            inscritosCount={inscritosCount ?? 0}
          />

        </div>

        <BottomNav />
      </div>
    </div>
  )
}
