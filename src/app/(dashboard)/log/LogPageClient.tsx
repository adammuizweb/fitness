'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogForm } from '@/components/logs/LogForm'
import { LogList } from '@/components/logs/LogList'
import { useTodayLogs } from '@/hooks/useLogs'
import type { Exercise, WorkoutLog } from '@/types'

interface Props {
  exercises: Exercise[]
  todayLogs: WorkoutLog[]
}

export function LogPageClient({ exercises: initialExercises, todayLogs: initialLogs }: Props) {
  const { data: logs } = useTodayLogs()
  const [selectedExercise, setSelectedExercise] = useState('')

  const displayLogs = logs || initialLogs
  const loggedExerciseIds = new Set(displayLogs.map((l) => l.exercise_id))
  const availableExercises = selectedExercise
    ? initialExercises.filter((e) => e.id === selectedExercise)
    : initialExercises.filter((e) => !loggedExerciseIds.has(e.id))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Log Workout</h1>
        <p className="text-gray-500 text-sm mt-1">
          Catat workoutmu hari ini, {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tambah Log</CardTitle>
            </CardHeader>
            <CardContent>
              <LogForm
                exercises={availableExercises}
                onSelectExercise={setSelectedExercise}
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
