import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = [
  '/profil', 
  '/mistik-rehber',
  '/numeroloji',
  '/biyoritim',
  '/horary',
  '/ruya-analizi',
  '/uyumluluk',
  '/dogum-haritasi',
  '/iching',
  '/katina',
  '/kristal',
  '/runler',
  '/fallar'
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only run Supabase auth check for routes that actually need it.
  // Calling getSession() on every page (e.g. /dogum-haritasi) hammers the
  // Supabase auth API and causes rate-limit errors under rapid navigation.
  const needsAuthCheck =
    pathname === '/onboarding' ||
    PROTECTED_ROUTES.some(p => pathname.startsWith(p));

  if (!needsAuthCheck) {
    return NextResponse.next();
  }

  const hasProfile = req.cookies.get('has-profile')?.value === 'true';

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
          res = NextResponse.next({ request: { headers: req.headers } });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          req.cookies.delete({ name, ...options });
          res = NextResponse.next({ request: { headers: req.headers } });
          res.cookies.delete({ name, ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    if (pathname === '/onboarding' && hasProfile) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/profil';
      return NextResponse.redirect(redirectUrl);
    }
    return res;
  }

  // Not logged in — block private routes
  if (PROTECTED_ROUTES.some(p => pathname.startsWith(p))) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/onboarding';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|icon-192.png|icon-512.png).*)'],
};
