'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY = 'fitness_session_backup'

const supabase = createClient()

export function AuthPersistence() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Coba restore session dari localStorage saat app dimuat
    // Ini berguna untuk PWA iOS/Safari yang tidak share cookies dengan Safari
    const restoreSession = async () => {
      try {
        const { data: { session: cookieSession } } = await supabase.auth.getSession()
        if (cookieSession) return

        const saved = localStorage.getItem(STORAGE_KEY)
        if (!saved) return

        const parsed = JSON.parse(saved)
        if (parsed?.access_token && parsed?.refresh_token) {
          await supabase.auth.setSession({
            access_token: parsed.access_token,
            refresh_token: parsed.refresh_token,
          })
        }
      } catch {
        // ignore
      }
    }

    restoreSession()

    // Simpan session ke localStorage setiap kali berubah
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      try {
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem(STORAGE_KEY)
        } else if (session) {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at,
            })
          )
        }
      } catch {
        // ignore
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return null
}
