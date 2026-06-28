'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import { Dumbbell, ClipboardList, Flame, TrendingUp, Loader2 } from 'lucide-react'
import { useTodayLogs } from '@/hooks/useLogs'
import { useStreak } from '@/hooks/useStreak'
import { useWorkouts } from '@/hooks/useWorkouts'

export function DashboardClient() {
  const { t } = useI18n()
  const { data: logs = [], isLoading: logsLoading } = useTodayLogs()
  const { data: streak, isLoading: streakLoading } = useStreak()
  const { data: workouts, isLoading: workoutsLoading } = useWorkouts()

  if (logsLoading || streakLoading || workoutsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  const totalWorkouts = workouts?.length || 0
  const totalSets = logs.reduce((sum, log) => sum + (log.sets || 0), 0)
  const totalReps = logs.reduce((sum, log) => sum + (log.reps || 0), 0)
  const currentStreak = streak?.current_streak || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {logs.length === 0
              ? t('dashboard.noWorkout')
              : t('dashboard.loggedCount', { count: logs.length })}
          </p>
        </div>

        <Link href="/dashboard/log">
          <Button>
            <ClipboardList className="w-4 h-4 mr-2" />
            {t('dashboard.logWorkout')}
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('dashboard.streak')}</p>
              <p className="text-2xl font-bold">{currentStreak}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('dashboard.workouts')}</p>
              <p className="text-2xl font-bold">{totalWorkouts}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('dashboard.setsToday')}</p>
              <p className="text-2xl font-bold">{totalSets}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.workoutToday')}</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">
                {t('dashboard.noWorkout')}
              </p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{log.workout?.name}</p>
                      <p className="text-sm text-gray-500">
                        {log.sets && log.sets > 0
                          ? `${log.sets} set x ${log.reps} rep${log.weight ? ` \u2022 ${log.weight} kg` : ''}`
                          : `${log.distance} m \u2022 ${log.duration} menit`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.repsToday')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{totalReps}</p>
            <p className="text-sm text-gray-500 mt-1">
              {currentStreak > 0 && t('dashboard.streakFire', { count: currentStreak })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
