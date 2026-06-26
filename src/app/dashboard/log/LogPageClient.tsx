'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogForm } from '@/components/logs/LogForm'
import { LogList } from '@/components/logs/LogList'
import { useTodayLogs } from '@/hooks/useLogs'
import type { WorkoutLog, WorkoutSchedule } from '@/types'

interface Props {
  schedules: WorkoutSchedule[]
  todayLogs: WorkoutLog[]
}

export function LogPageClient({ schedules: initialSchedules, todayLogs: initialLogs }: Props) {
  const { data: logs } = useTodayLogs()
  const displayLogs = logs || initialLogs
  const [selected, setSelected] = useState('')

  const loggedWorkoutIds = new Set(displayLogs.map((l) => l.workout_id))
  const scheduledWorkouts = initialSchedules
    .map((s) => s.workout)
    .filter((w): w is NonNullable<typeof w> => w !== null)

  const unscheduledWorkouts = selected
    ? scheduledWorkouts.filter((w) => w.id === selected)
    : scheduledWorkouts.filter((w) => !loggedWorkoutIds.has(w.id))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Workout Hari Ini</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {scheduledWorkouts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Jadwal Hari Ini</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scheduledWorkouts.map((w) => (
                    <div key={w.id} className="flex items-center justify-between py-1">
                      <span className="text-sm">{w.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${loggedWorkoutIds.has(w.id) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {loggedWorkoutIds.has(w.id) ? 'Selesai' : 'Belum'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Log Manual</CardTitle>
            </CardHeader>
            <CardContent>
              <LogForm
                workouts={unscheduledWorkouts}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Log Hari Ini ({displayLogs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <LogList logs={displayLogs} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
