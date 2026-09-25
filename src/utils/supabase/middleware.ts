import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Require +18 consent cookie
  const hasConsent = request.cookies.has('age_consent')

  // Let's implement path protection
  const isAdminPath = pathname.startsWith('/admin')
  const isLoginPath = pathname.startsWith('/admin/login')

  if (isAdminPath) {
    if (!user && !isLoginPath) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    if (user) {
      // Check for role & must_change_password
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, must_change_password')
        .eq('id', user.id)
        .single()

      if (profile) {
        if (profile.must_change_password && pathname !== '/admin/change-password') {
          const url = request.nextUrl.clone()
          url.pathname = '/admin/change-password'
          return NextResponse.redirect(url)
        }

        if (!profile.must_change_password && (isLoginPath || pathname === '/admin/change-password')) {
           const url = request.nextUrl.clone()
           url.pathname = '/admin/dashboard'
           return NextResponse.redirect(url)
        }
      }
    }
  }

  return supabaseResponse
}
