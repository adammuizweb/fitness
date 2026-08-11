import { NextResponse } from 'next/server'
import { getApiAdminUser } from '@/lib/apiAdmin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const user = await getApiAdminUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin.rpc('get_admin_stats')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ stats: data })
}
