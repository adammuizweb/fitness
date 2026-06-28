'use client'

import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useI18n } from '@/lib/i18n/context'
import { StreakCalendar } from '@/components/streak/StreakCalendar'
import { StreakStats } from '@/components/streak/StreakStats'
import type { DailyStreak } from '@/types'

interface Props {
  streak: DailyStreak | null
  activeDates: Set<string>
}

export function StreakClient({ streak, activeDates }: Props) {
  const { t } = useI18n()

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: t('nav.streak') },
      ]} />
      <div>
        <h1 className="text-2xl font-bold">{t('streak.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('streak.subtitle')}</p>
      </div>

      <StreakStats streak={streak} />
      <StreakCalendar activeDates={activeDates} />
    </div>
  )
}
