import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({ name, value, ...options });
          res = NextResponse.next({
            request: { headers: req.headers },
          });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          req.cookies.delete({ name, ...options });
          res = NextResponse.next({
            request: { headers: req.headers },
          });
          res.cookies.delete({ name, ...options });
        },
      },
    }
  );

  // Check session and profile cookie
  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = req.nextUrl;
  const hasProfile = req.cookies.get('has-profile')?.value === 'true';

  // 1. If user is logged in
  if (session) {
    // If they have a profile, don't let them see onboarding
    if (pathname === '/onboarding' && hasProfile) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/profil';
      return NextResponse.redirect(redirectUrl);
    }
    
    // If they are on a protected route but don't have a profile (and we didn't check yet)
    // we allow it for now, the page will handle it or we could do a DB check here.
    // For zero-flicker, we prioritize the cookie.
    return res;
  }

  // 2. If user is NOT logged in
  const protectedRoutes = ['/profil', '/mistik-rehber'];
  if (protectedRoutes.some(path => pathname.startsWith(path))) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/onboarding';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
