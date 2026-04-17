import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getURL } from '@/lib/url-helpers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code);
    
    if (session?.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile) {
        // Set a cookie to flag that the user has a profile
        // This helps the middleware redirect without a DB lookup
        cookieStore.set('has-profile', 'true', {
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          sameSite: 'lax',
        });
        
        // User already has a profile, go to dashboard
        return NextResponse.redirect(`${getURL()}profil`);
      }
    }
  }

  // New user or no profile found, go to onboarding
  return NextResponse.redirect(`${getURL()}onboarding`);
}
