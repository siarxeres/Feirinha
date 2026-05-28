import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/feiras', '/perfil', '/inscricoes', '/servicos']
const AUTH_ROUTES = ['/auth/login', '/auth/cadastro']
const AUTH_PUBLIC = ['/auth/recuperar-senha', '/auth/nova-senha', '/auth/callback', '/auth/confirmar']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Rotas públicas de auth
  const isPublicAuthRoute = AUTH_PUBLIC.some(r => pathname.startsWith(r))
  if (isPublicAuthRoute) return supabaseResponse

  // Redireciona não autenticados nas rotas protegidas
  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Redireciona autenticados para fora das rotas de auth
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Verifica onboarding para usuários autenticados
  // Ignora a própria rota /onboarding para evitar loop
  if (user && !pathname.startsWith('/onboarding') && !pathname.startsWith('/auth') && !pathname.startsWith('/api')) {
    // Usa service role para bypassar RLS — anon key pode não ter permissão de leitura no profiles
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('onboarding_completo, roles')
      .eq('id', user.id)
      .maybeSingle()

    console.log('[middleware] profile:', profile)

    const rawRoles = profile?.roles
    let roles: string[] = []
    if (Array.isArray(rawRoles)) {
      roles = rawRoles
    } else if (typeof rawRoles === 'string') {
      roles = rawRoles
        .replace(/^\{|\}$/g, '')
        .split(',')
        .map(r => r.trim().replace(/^"|"$/g, ''))
        .filter(Boolean)
    }

    // Só redireciona se o campo existir e for explicitamente false
    // null/undefined = perfil novo, não forçamos onboarding ainda
    if (profile?.onboarding_completo === false) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }

    // Roteia /dashboard para o sub-dashboard correto baseado no role
    if (pathname === '/dashboard') {
      const url = request.nextUrl.clone()
      if (roles.includes('admin'))       url.pathname = '/dashboard/admin'
      else if (roles.includes('organizador')) url.pathname = '/dashboard/organizador'
      else if (roles.includes('feirante'))    url.pathname = '/dashboard/feirante'
      else                               url.pathname = '/dashboard/consumidor'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}