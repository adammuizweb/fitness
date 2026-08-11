import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  await supabase.auth.signOut()

  const loginUrl = new URL('/login', request.url)
  if (request.nextUrl.searchParams.get('banned') === 'true') {
    loginUrl.searchParams.set('banned', 'true')
  }
  return NextResponse.redirect(loginUrl)
}
