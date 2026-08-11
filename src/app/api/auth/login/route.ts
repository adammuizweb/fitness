import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getClientIp, hashRateLimitKey, normalizeLoginIdentifier } from '@/lib/loginRateLimit'

interface RateLimitDecision {
  allowed?: boolean
  blocked?: boolean
  retry_after?: number
}

function rateLimited(retryAfter: number) {
  const seconds = Math.max(1, retryAfter)
  return NextResponse.json(
    { error: 'rate_limited', retryAfter: seconds },
    { status: 429, headers: { 'Retry-After': String(seconds) } },
  )
}

export async function POST(request: NextRequest) {
  let body: { email?: unknown; password?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  if (typeof body.email !== 'string' || typeof body.password !== 'string') {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  const email = normalizeLoginIdentifier(body.email)
  const password = body.password
  if (!email || email.length > 254 || !password || password.length > 1024) {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 })
  }

  const ipHash = hashRateLimitKey(getClientIp(request))
  const accountHash = hashRateLimitKey(email)
  const admin = createAdminClient()

  const { data: check, error: checkError } = await admin.rpc('check_login_rate_limit', {
    p_ip_hash: ipHash,
    p_account_hash: accountHash,
  })

  if (checkError) {
    console.error('Login rate-limit check failed:', checkError.message)
    return NextResponse.json({ error: 'security_unavailable' }, { status: 503 })
  }

  const decision = check as RateLimitDecision | null
  if (decision?.allowed === false) {
    return rateLimited(decision.retry_after || 1)
  }

  const supabase = await createServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    if (error?.code === 'user_banned') {
      return NextResponse.json({ error: 'account_banned' }, { status: 403 })
    }
    if (error?.status === 429) {
      return rateLimited(300)
    }
    if (error?.code !== 'invalid_credentials') {
      console.error('Supabase login failed:', error?.code, error?.message)
      return NextResponse.json({ error: 'security_unavailable' }, { status: 503 })
    }

    const { data: failure, error: failureError } = await admin.rpc('record_login_failure', {
      p_ip_hash: ipHash,
      p_account_hash: accountHash,
    })

    if (failureError) {
      console.error('Login failure recording failed:', failureError.message)
      return NextResponse.json({ error: 'security_unavailable' }, { status: 503 })
    }

    const failureDecision = failure as RateLimitDecision | null
    if (failureDecision?.blocked) {
      return rateLimited(failureDecision.retry_after || 1)
    }

    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('is_banned')
    .eq('id', data.user.id)
    .single()

  if (profileError || !profile) {
    console.error('Login profile check failed:', profileError?.message || 'Profile not found')
    await supabase.auth.signOut()
    return NextResponse.json({ error: 'security_unavailable' }, { status: 503 })
  }

  if (profile.is_banned) {
    await supabase.auth.signOut()
    return NextResponse.json({ error: 'account_banned' }, { status: 403 })
  }

  const { error: clearError } = await admin.rpc('clear_account_login_failures', {
    p_account_hash: accountHash,
  })
  if (clearError) console.error('Login failure reset failed:', clearError.message)

  return NextResponse.json({ success: true })
}
