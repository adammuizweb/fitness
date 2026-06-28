'use client'

import { useMemo } from 'react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useI18n } from '@/lib/i18n/context'
import { StreakCalendar } from '@/components/streak/StreakCalendar'
import { StreakStats } from '@/components/streak/StreakStats'
import { useStreak } from '@/hooks/useStreak'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

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
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
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
