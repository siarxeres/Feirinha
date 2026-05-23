import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single()
  const roles = profile?.roles ?? []
  if (roles.includes('organizador')) redirect('/dashboard/organizador')
  if (roles.includes('feirante')) redirect('/dashboard/feirante')
  redirect('/dashboard/consumidor')
}