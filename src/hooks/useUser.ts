'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

const supabase = createClient()

async function fetchProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    return {
      id: user.id,
      username: user.email?.split('@')[0] ?? 'user',
      full_name: user.email ?? '',
      avatar_url: null,
      role: 'user' as const,
      is_banned: false,
      created_at: user.created_at ?? new Date().toISOString(),
      updated_at: user.created_at ?? new Date().toISOString(),
    } as Profile
  }

  return data
}

export function useUser() {
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 1000 * 60,
  })

  return { profile: profile ?? null, loading: isLoading, refetch }
}
