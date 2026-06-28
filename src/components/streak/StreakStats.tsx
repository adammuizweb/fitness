'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n/context'
import { Flame, TrendingUp, Clock } from 'lucide-react'
import type { DailyStreak } from '@/types'

interface Props {
  streak: DailyStreak | null
}

export function StreakStats({ streak }: Props) {
  const { t } = useI18n()
  const currentStreak = streak?.current_streak || 0
  const longestStreak = streak?.longest_streak || 0
  const lastDate = streak?.last_activity_date

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
            <Flame className={`w-6 h-6 ${currentStreak >= 7 ? 'text-orange-500' : 'text-orange-400'}`} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('streak.current')}</p>
            <p className="text-2xl font-bold">{currentStreak} {currentStreak >= 7 && <span className="text-sm">{t('streak.onFire')}</span>}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('streak.longest')}</p>
            <p className="text-2xl font-bold">{longestStreak}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
            <Clock className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('streak.last')}</p>
            <p className="text-2xl font-bold">
              {lastDate
                ? new Date(lastDate).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
                : '-'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
