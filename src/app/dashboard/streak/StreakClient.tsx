'use client'

import { useMemo } from 'react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useI18n } from '@/lib/i18n/context'
import { StreakCalendar } from '@/components/streak/StreakCalendar'
import { StreakStats } from '@/components/streak/StreakStats'
import { useStreak } from '@/hooks/useStreak'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/Skeleton'

const supabase = createClient()

export function StreakClient() {
  const { t } = useI18n()
  const { data: streak, isLoading: streakLoading } = useStreak()

  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['logs', 'last6months'],
    queryFn: async () => {
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      const since = sixMonthsAgo.toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('workout_logs')
        .select('logged_date')
        .gte('logged_date', since)
        .order('logged_date')
      if (error) throw error
      return data
    },
  })

  const activeDates = useMemo(() => new Set(logs.map((l) => l.logged_date)), [logs])

  if (streakLoading || logsLoading) {
    return <StreakSkeleton />
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: t('nav.streak') },
      ]} />
      <div>
        <h1 className="text-2xl font-bold">{t('streak.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('streak.subtitle')}</p>
      </div>

      <StreakStats streak={streak ?? null} />
      <StreakCalendar activeDates={activeDates} />
    </div>
  )
}

function StreakSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-7 w-48 mb-2" />
      <Skeleton className="h-4 w-64 mb-6" />

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <Skeleton className="h-5 w-48 mb-4" />
        <div className="flex flex-wrap gap-1">
          {[...Array(50)].map((_, i) => (
            <Skeleton key={i} className="h-3 w-3 rounded-sm" />
          ))}
        </div>
      </div>
    </div>
  )
}
