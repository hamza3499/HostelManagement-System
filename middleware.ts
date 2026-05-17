import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  // Skip middleware completely for assets, static files, images
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return supabaseResponse;
  }

  // Define route types
  const isProtectedAdmin = pathname.startsWith('/admin');
  const isProtectedStudent = pathname.startsWith('/student');
  const isAuthPage = pathname.startsWith('/auth');
  const isLandingPage = pathname === '/';

  // If it's the landing page, we don't need auth checks or DB roundtrips!
  if (isLandingPage) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // We only run getUser() if the route is protected or is an auth page
  if (isProtectedAdmin || isProtectedStudent || isAuthPage) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      if (isProtectedAdmin || isProtectedStudent) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/auth/login';
        return NextResponse.redirect(redirectUrl);
      }
      return supabaseResponse;
    }

    // Retrieve role from cookies or user metadata, with fallback to DB
    let role = request.cookies.get('hms-user-role')?.value;

    if (!role) {
      // Fallback 1: check user metadata
      role = user.user_metadata?.role;

      if (!role) {
        // Fallback 2: query database profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        role = profile?.role;
      }

      // If we found a role, cache it in a secure cookie to make next requests instant
      if (role) {
        supabaseResponse.cookies.set('hms-user-role', role, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          secure: true,
          sameSite: 'lax',
        });
      }
    }

    // Redirect logged-in users away from auth pages
    if (isAuthPage) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = role === 'admin' ? '/admin' : '/student/dashboard';
      return NextResponse.redirect(redirectUrl);
    }

    // Protect admin routes
    if (isProtectedAdmin && role !== 'admin') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/student/dashboard';
      return NextResponse.redirect(redirectUrl);
    }

    // Protect student routes
    if (isProtectedStudent && role !== 'student') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/admin';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
