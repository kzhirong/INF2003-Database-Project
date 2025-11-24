import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  await supabase.auth.signOut();

  // Redirect to login page
  const origin = request.nextUrl.origin;
  return NextResponse.redirect(`${origin}/`);
}
