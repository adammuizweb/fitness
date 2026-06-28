'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { RestDay, DayOfWeek } from '@/types'

const supabase = createClient()

async function fetchRestDays(): Promise<RestDay[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('rest_days')
    .select('*')
    .eq('user_id', user.id)

  if (error) throw error
  return data || []
}

async function toggleRestDay(dayOfWeek: DayOfWeek, currentlySet: boolean): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  if (currentlySet) {
    await supabase
      .from('rest_days')
      .delete()
      .eq('user_id', user.id)
      .eq('day_of_week', dayOfWeek)
  } else {
    await supabase
      .from('rest_days')
      .insert({ user_id: user.id, day_of_week: dayOfWeek })
  }
}

export function useRestDays() {
  return useQuery({
    queryKey: ['restDays'],
    queryFn: fetchRestDays,
  })
}

export function useToggleRestDay() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ dayOfWeek, currentlySet }: { dayOfWeek: DayOfWeek; currentlySet: boolean }) =>
      toggleRestDay(dayOfWeek, currentlySet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restDays'] })
    },
  })
}
