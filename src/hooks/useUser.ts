'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

export function useUser() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        setProfile({
          id: user.id,
          username: user.email?.split('@')[0] ?? 'user',
          full_name: user.email ?? '',
          role: 'user',
          is_banned: false,
          created_at: user.created_at ?? new Date().toISOString(),
          updated_at: user.created_at ?? new Date().toISOString(),
        } as Profile)
        setLoading(false)
        return
      }

      setProfile(data)
      setLoading(false)
    }

    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load())

    return () => subscription.unsubscribe()
  }, [supabase])

  return { profile, loading }
}
