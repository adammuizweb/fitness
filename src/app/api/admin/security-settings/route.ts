import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getApiAdminUser } from '@/lib/apiAdmin'
import { createAdminClient } from '@/lib/supabase/admin'

const settingsSchema = z.object({
  login_rate_limit_enabled: z.boolean(),
  account_max_attempts: z.number().int().min(1).max(100),
  ip_max_attempts: z.number().int().min(1).max(500),
  attempt_window_minutes: z.number().int().min(1).max(1440),
  block_minutes: z.number().int().min(1).max(10080),
})

export async function GET() {
  const user = await getApiAdminUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: settings, error } = await admin
    .from('security_settings')
    .select('*')
    .eq('id', 1)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const now = new Date().toISOString()
  const windowStart = new Date(Date.now() - settings.attempt_window_minutes * 60_000).toISOString()
  const [blockedResult, activeResult] = await Promise.all([
    admin.from('login_rate_limits').select('*', { count: 'exact', head: true }).gt('blocked_until', now),
    admin.from('login_rate_limits').select('*', { count: 'exact', head: true }).gte('last_attempt_at', windowStart),
  ])
  if (blockedResult.error || activeResult.error) {
    return NextResponse.json({ error: 'Failed to load rate-limit statistics' }, { status: 500 })
  }

  return NextResponse.json({
    settings,
    stats: {
      blockedBuckets: blockedResult.count || 0,
      activeBuckets: activeResult.count || 0,
    },
  })
}

export async function PUT(request: NextRequest) {
  const user = await getApiAdminUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = settingsSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid security settings' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: settings, error } = await admin.rpc('update_security_settings', {
    p_actor_id: user.id,
    p_login_rate_limit_enabled: parsed.data.login_rate_limit_enabled,
    p_account_max_attempts: parsed.data.account_max_attempts,
    p_ip_max_attempts: parsed.data.ip_max_attempts,
    p_attempt_window_minutes: parsed.data.attempt_window_minutes,
    p_block_minutes: parsed.data.block_minutes,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ settings })
}

export async function DELETE() {
  const user = await getApiAdminUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { error } = await admin.rpc('clear_all_login_rate_limits', { p_actor_id: user.id })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
