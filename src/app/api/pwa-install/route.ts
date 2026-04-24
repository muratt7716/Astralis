import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  const userAgent = req.headers.get('user-agent') || null;

  const { error } = await supabaseAdmin
    .from('pwa_installs')
    .insert({ user_agent: userAgent });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
