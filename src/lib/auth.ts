import { createClient as createServerClient } from './supabase/server'
import { createClient as createAdminClient } from './supabase/admin'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types'

export async function getCurrentUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await createServerClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  return user
}

export async function requireUnbanned() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await createServerClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_banned')
    .eq('id', user.id)
    .single()

  if (profile?.is_banned) {
    const admin = createAdminClient()
    await admin.auth.admin.signOut(user.id)
    redirect('/login?banned=true')
  }

  return user
}
