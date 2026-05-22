import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/auth/nova-senha'

  console.log('[callback] url:', request.url)
  console.log('[callback] code:', code ? `${code.slice(0, 8)}…` : null)
  console.log('[callback] next:', next, '| redirect param:', searchParams.get('redirect'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
    console.log('[callback] exchangeCodeForSession error:', error.message)
  }

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session) return NextResponse.redirect(`${origin}/auth/nova-senha`)

  return NextResponse.redirect(`${origin}/auth/login?error=auth`)
}
