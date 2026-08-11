'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Profile, StatsOverview } from '@/types'

const supabase = createClient()

async function fetchUsers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

async function updateUser(id: string, updates: Partial<Profile>): Promise<Profile> {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: updates.role, is_banned: updates.is_banned }),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Failed to update user')
  return result.user
}

async function fetchStats(): Promise<StatsOverview> {
  const response = await fetch('/api/admin/stats', { cache: 'no-store' })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Failed to load statistics')
  return result.stats
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: fetchUsers,
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Partial<Profile>) =>
      updateUser(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchStats,
  })
}
