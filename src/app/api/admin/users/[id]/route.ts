import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getApiAdminUser } from '@/lib/apiAdmin'
import { createAdminClient } from '@/lib/supabase/admin'

const updatesSchema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  is_banned: z.boolean().optional(),
}).refine((updates) => updates.role !== undefined || updates.is_banned !== undefined)

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminUser = await getApiAdminUser()
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = updatesSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid user update' }, { status: 400 })

  const { id } = await params
  const admin = createAdminClient()
  const { data: updateResult, error } = await admin.rpc('update_admin_managed_profile', {
    p_actor_id: adminUser.id,
    p_target_id: id,
    p_role: parsed.data.role ?? null,
    p_is_banned: parsed.data.is_banned ?? null,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const result = updateResult as {
    previous: { role: 'user' | 'admin'; is_banned: boolean }
    current: Record<string, unknown>
  }

  if (parsed.data.is_banned !== undefined) {
    const { error: authError } = await admin.auth.admin.updateUserById(id, {
      ban_duration: parsed.data.is_banned ? '876000h' : 'none',
    })
    if (authError) {
      await admin.from('profiles').update({
        role: result.previous.role,
        is_banned: result.previous.is_banned,
      }).eq('id', id)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ user: result.current })
}
