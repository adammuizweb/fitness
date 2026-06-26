'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!profile || profile.role !== 'admin')) {
      router.push('/dashboard')
    }
  }, [loading, profile, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!profile || profile.role !== 'admin') return null

  return <>{children}</>
}
