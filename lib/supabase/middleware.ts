import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables")
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
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

  let user = null
  try {
    const {
      data: { user: fetchedUser },
      error,
    } = await supabase.auth.getUser()
    
    // If refresh token is invalid, clear cookies and continue silently
    if (error && (error.message?.includes("refresh_token_not_found") || error.code === "refresh_token_not_found")) {
      // Clear invalid auth cookies - Supabase uses dynamic cookie names
      // Pattern: sb-<project-ref>-auth-token (access and refresh)
      const allCookies = request.cookies.getAll()
      allCookies.forEach((cookie) => {
        // Match Supabase auth cookie patterns
        if (
          cookie.name.includes("auth-token") ||
          cookie.name.includes("access-token") ||
          cookie.name.includes("refresh-token") ||
          cookie.name.startsWith("sb-")
        ) {
          request.cookies.delete(cookie.name)
          supabaseResponse.cookies.delete(cookie.name)
        }
      })
      // Silently continue - user will be treated as unauthenticated
      // Don't log to avoid spam
      user = null
    } else if (error) {
      // Other auth errors - only log in development
      if (process.env.NODE_ENV === "development" && !error.message?.includes("refresh_token")) {
        console.warn("Auth error (non-critical):", error.message)
      }
      user = null
    } else {
      user = fetchedUser
    }
  } catch (error: any) {
    // Handle refresh token errors silently - don't spam logs
    if (error?.message?.includes("refresh_token") || error?.code === "refresh_token_not_found") {
      // Clear invalid cookies
      const allCookies = request.cookies.getAll()
      allCookies.forEach((cookie) => {
        if (
          cookie.name.includes("auth-token") ||
          cookie.name.includes("access-token") ||
          cookie.name.includes("refresh-token") ||
          cookie.name.startsWith("sb-")
        ) {
          request.cookies.delete(cookie.name)
          supabaseResponse.cookies.delete(cookie.name)
        }
      })
      // Silently continue - don't log
    }
    // Continue as unauthenticated user - don't log to avoid spam
    user = null
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/resend-confirmation",
    "/auth/confirm-email",
    "/quiz",
    "/plan",
    "/pricing",
    "/checkout",
    "/terminos",
    "/privacidad",
    "/reembolsos",
    "/disclaimer",
  ]

  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  ) || request.nextUrl.pathname === "/"

  // Block unauthenticated users from protected routes
  if (!user && !isPublicRoute && !request.nextUrl.pathname.startsWith("/api")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Block unconfirmed users from protected routes (except email confirmation)
  if (user && !user.email_confirmed_at && !isPublicRoute && !request.nextUrl.pathname.startsWith("/api")) {
    // Allow access to email confirmation page
    if (request.nextUrl.pathname.startsWith("/auth/confirm-email")) {
      return supabaseResponse
    }
    
    // Redirect unconfirmed users to a page explaining they need to confirm
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("unconfirmed", "true")
    return NextResponse.redirect(url)
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

