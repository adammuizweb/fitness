'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dumbbell, ClipboardList, Flame, TrendingUp, Plus } from 'lucide-react'
import type { WorkoutLog, DailyStreak } from '@/types'

interface Props {
  logs: WorkoutLog[]
  streak: DailyStreak | null
  totalExercises: number
}

export function DashboardClient({ logs, streak, totalExercises }: Props) {
  const totalSets = logs.reduce((sum, log) => sum + log.sets, 0)
  const totalReps = logs.reduce((sum, log) => sum + log.reps, 0)
  const currentStreak = streak?.current_streak || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {logs.length === 0
              ? 'Belum ada workout hari ini. Ayo mulai!'
              : `${logs.length} exercise telah dilog hari ini`}
          </p>
        </div>
        <Link href="/dashboard/log">
          <Button>
            <Plus className="w-4 h-4" />
            Log Workout
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Flame className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{currentStreak}</p>
              <p className="text-xs text-gray-500">Streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalExercises}</p>
              <p className="text-xs text-gray-500">Exercises</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalSets}</p>
              <p className="text-xs text-gray-500">Sets Hari Ini</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalReps}</p>
              <p className="text-xs text-gray-500">Reps Hari Ini</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Workout Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-100">
              {logs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{log.exercise?.name}</p>
                    <p className="text-sm text-gray-500">
                      {log.sets} set x {log.reps} rep
                      {log.weight ? ` • ${log.weight} kg` : ''}
                    </p>
                  </div>
                  {log.notes && (
                    <span className="text-xs text-gray-400 max-w-[200px] truncate">
                      {log.notes}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {currentStreak >= 7 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl">🔥</p>
            <p className="font-semibold text-orange-800">
              Streak {currentStreak} hari! Luar biasa!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
