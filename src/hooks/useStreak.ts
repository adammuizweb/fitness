'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { DailyStreak } from '@/types'

const supabase = createClient()

async function fetchStreak(): Promise<DailyStreak | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('daily_streaks')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data
}

export function useStreak() {
  return useQuery({
    queryKey: ['streak'],
    queryFn: fetchStreak,
  })
}
