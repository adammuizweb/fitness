import { createClient as createServerClient } from './supabase/server'
import { createAdminClient } from './supabase/admin'
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

  const admin = createAdminClient()
  const { data } = await admin
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

  const admin = createAdminClient()
  const { data: profile, error } = await admin
    .from('profiles')
    .select('role, is_banned')
    .eq('id', user.id)
    .single()

  if (error || !profile) redirect('/login')

  if (profile.is_banned) {
    redirect('/api/auth/signout?banned=true')
  }

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  return user
}

export async function requireUnbanned() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile, error } = await admin
    .from('profiles')
    .select('is_banned')
    .eq('id', user.id)
    .single()

  if (error || !profile) redirect('/login')

  if (profile.is_banned) {
    redirect('/api/auth/signout?banned=true')
  }

  return user
}
