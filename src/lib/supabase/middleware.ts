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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // Skip middleware for logout route - let it handle signout
  if (request.nextUrl.pathname === '/api/logout') {
    return supabaseResponse
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Allow access to login page, signup page, and auth routes
  const isAuthRoute = request.nextUrl.pathname === '/' ||
                      request.nextUrl.pathname === '/signup' ||
                      request.nextUrl.pathname.startsWith('/auth')

  // If no user and not on auth route, redirect to login
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // If user is logged in, check role-based access
  if (user) {
    // Skip role-based restrictions for API routes
    const isApiRoute = request.nextUrl.pathname.startsWith('/api')

    if (!isApiRoute) {
      // Get user role from database
      const { data: userData } = await supabase
        .from('users')
        .select('role, cca_id')
        .eq('id', user.id)
        .single()

      if (userData) {
        const { role, cca_id } = userData

        // If on login page, redirect based on role
        if (request.nextUrl.pathname === '/') {
          const url = request.nextUrl.clone()
          if (role === 'system_admin') {
            url.pathname = '/admin'
          } else if (role === 'cca_admin' && cca_id) {
            url.pathname = `/ccas/${cca_id}/edit`
          } else {
            url.pathname = '/dashboard'
          }
          return NextResponse.redirect(url)
        }

        // System Admin restrictions: Can ONLY access admin page
        if (role === 'system_admin') {
          const isAdminPage = request.nextUrl.pathname === '/admin'

          if (!isAdminPage) {
            // Redirect system admin back to admin page if they try to access anything else
            const url = request.nextUrl.clone()
            url.pathname = '/admin'
            return NextResponse.redirect(url)
          }
        }

      // CCA Admin restrictions: Can ONLY access their CCA edit page
      if (role === 'cca_admin') {
        const allowedPath = `/ccas/${cca_id}/edit`
        const isAllowedPath = request.nextUrl.pathname === allowedPath

        if (!isAllowedPath) {
          // Redirect CCA admin back to their edit page if they try to access anything else
          const url = request.nextUrl.clone()
          url.pathname = allowedPath
          return NextResponse.redirect(url)
        }
      }

      // Student restrictions: Cannot access any edit pages or admin pages
      if (role === 'student') {
        const isEditPage = request.nextUrl.pathname.includes('/edit')
        const isAdminPage = request.nextUrl.pathname === '/admin'

        if (isEditPage || isAdminPage) {
          // Redirect students away from restricted pages
          const url = request.nextUrl.clone()
          url.pathname = '/dashboard'
          return NextResponse.redirect(url)
        }
      }
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse
}
