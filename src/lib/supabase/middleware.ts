import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not run getUser() if the route is public (like /, /dang-nhap, etc.)
  // This saves execution time and reduces 500 risks in middleware
  const { pathname } = request.nextUrl;
  
  const isDashboardRoute = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/classes') || 
                          pathname.startsWith('/students') || 
                          pathname.startsWith('/attendance') || 
                          pathname.startsWith('/analytics') || 
                          pathname.startsWith('/reports') || 
                          pathname.startsWith('/settings') || 
                          pathname.startsWith('/announcements') || 
                          pathname.startsWith('/staff') ||
                          pathname.startsWith('/coach');

  if (!isDashboardRoute) {
    return supabaseResponse;
  }

  // Check auth for protected routes — wrapped in try-catch to prevent 500 crashes
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch (err) {
    console.error('[Middleware] getUser() crashed:', err);
    // Session corrupted or Supabase down → redirect to login safely
    const url = request.nextUrl.clone();
    url.pathname = '/dang-nhap';
    return NextResponse.redirect(url);
  }

  const coachSession = request.cookies.get('coach_session')?.value;

  // 1. Unauthenticated: Any protected route -> login
  if (!user && !coachSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/dang-nhap';
    return NextResponse.redirect(url);
  }

  // 2. Coach trying to access Admin dashboard: /dashboard, /students, etc.
  const isAdminPath = pathname.startsWith('/dashboard') || 
                     pathname.startsWith('/students') || 
                     pathname.startsWith('/classes') ||
                     pathname.startsWith('/analytics') ||
                     pathname.startsWith('/staff') ||
                     pathname.startsWith('/reports');
  
  if (isAdminPath && !user && coachSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/coach';
    return NextResponse.redirect(url);
  }

  // 3. Admin trying to access Coach portal: /coach
  if (pathname.startsWith('/coach') && user && !coachSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
