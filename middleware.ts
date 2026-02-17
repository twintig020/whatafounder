import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = [
  '/onboarding',
  '/consent',
  '/today',
  '/profile',
  '/settings',
]

const AUTH_ONLY_PATHS = [
  '/', // landing — redirect authenticated users to /today
]

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — do not add logic between createServerClient and getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Strip basePath to get the route path
  const basePath = '/whatafounder'
  const routePath = pathname.startsWith(basePath)
    ? pathname.slice(basePath.length) || '/'
    : pathname

  const isProtected = PROTECTED_PATHS.some((p) => routePath.startsWith(p))
  const isAuthOnly = AUTH_ONLY_PATHS.includes(routePath)

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = `${basePath}/`
    return NextResponse.redirect(url)
  }

  if (isAuthOnly && user) {
    const url = request.nextUrl.clone()
    url.pathname = `${basePath}/today`
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/whatafounder',
    '/whatafounder/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/).*)',
  ],
}
