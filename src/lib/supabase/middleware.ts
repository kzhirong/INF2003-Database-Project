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

  // Allow access to login page and auth routes
  const isAuthRoute = request.nextUrl.pathname === '/' ||
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
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      // If we can't fetch user data, redirect to login
      if (userError || !userData) {
        console.error('Error fetching user data in middleware:', userError)
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }

      const { role } = userData
      let cca_id: string | null = null

      // If CCA admin, get their CCA ID from cca_admin_details
      if (role === 'cca_admin') {
        const { data: adminData } = await supabase
          .from('cca_admin_details')
          .select('cca_id')
          .eq('user_id', user.id)
          .single()

        cca_id = adminData?.cca_id || null
      }

      // If on login page, redirect based on role
      if (request.nextUrl.pathname === '/') {
        const url = request.nextUrl.clone()
        if (role === 'system_admin') {
          url.pathname = '/admin'
        } else if (role === 'cca_admin' && cca_id) {
          url.pathname = `/cca-admin/${cca_id}`
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

      // CCA Admin restrictions: Can access their dashboard, members page, and edit page
      if (role === 'cca_admin') {
        const allowedPaths = [
          `/cca-admin/${cca_id}`,
          `/cca-admin/${cca_id}/members`,
          `/ccas/${cca_id}/edit`
        ]
        const isAllowedPath = allowedPaths.some(path => request.nextUrl.pathname === path)

        if (!isAllowedPath) {
          // Redirect CCA admin back to their dashboard if they try to access anything else
          const url = request.nextUrl.clone()
          url.pathname = `/cca-admin/${cca_id}`
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
