import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { isSuperAdmin } from '@/lib/auth/impersonation';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard'; // Redirect sau khi auth thành công
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (errorParam) {
    // Nếu Google trả về lỗi (VD: user từ chối cấp quyền)
    console.error('OAuth error from provider:', errorParam, errorDescription);
    return NextResponse.redirect(`${origin}/dang-nhap?error=GoogleAuthFailed`);
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const isSuper = await isSuperAdmin(data.user);
      let finalRedirect = next;
      if (isSuper && next === '/dashboard') {
        finalRedirect = '/super-admin';
      }
      return NextResponse.redirect(`${origin}${finalRedirect}`);
    }
    console.error('Auth callback error:', error);
    return NextResponse.redirect(`${origin}/dang-nhap?error=GoogleAuthFailed`);
  }

  // Quản trị lỗi nếu code hết hạn hoặc không xác thực được
  return NextResponse.redirect(`${origin}/dang-nhap?error=InvalidAuthData`);
}

