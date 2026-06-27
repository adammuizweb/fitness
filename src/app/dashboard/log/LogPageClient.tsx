'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTodayLogs, useUpsertLog, useToggleChecklistItem } from '@/hooks/useLogs'
import type { WorkoutLog, WorkoutSchedule, Workout } from '@/types'
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react'

interface ChecklistItem {
  workout: Workout
  log?: WorkoutLog
}

interface Props {
  schedules: WorkoutSchedule[]
  todayLogs: WorkoutLog[]
}

function formatDetail(item: ChecklistItem): string {
  const log = item.log
  if (log?.sets || log?.reps || log?.distance || log?.duration) {
    if (item.workout.type === 'cardio') {
      const parts: string[] = []
      if (log.distance) parts.push(`${log.distance} m`)
      if (log.duration) parts.push(`${log.duration} menit`)
      return parts.join(' • ')
    }
    const parts: string[] = []
    if (log.sets) parts.push(`${log.sets} set`)
    if (log.reps) parts.push(`${log.reps} rep`)
    if (log.weight) parts.push(`${log.weight} kg`)
    return parts.join(' × ')
  }
  const w = item.workout
  if (w.type === 'cardio') {
    const parts: string[] = []
    if (w.default_distance) parts.push(`${w.default_distance} m`)
    if (w.default_duration) parts.push(`${w.default_duration} menit`)
    return parts.join(' • ') || 'Cardio'
  }
  const parts: string[] = []
  if (w.default_sets) parts.push(`${w.default_sets} set`)
  if (w.default_reps) parts.push(`${w.default_reps} rep`)
  return parts.join(' × ') || 'Angkat Beban'
}

export function LogPageClient({ schedules: initialSchedules, todayLogs: initialLogs }: Props) {
  const { data: logs } = useTodayLogs()
  const displayLogs = logs || initialLogs
  const toggleMutation = useToggleChecklistItem()
  const upsertMutation = useUpsertLog()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, Record<string, string>>>({})

  const scheduledWorkouts = initialSchedules
    .map((s) => s.workout)
    .filter((w): w is NonNullable<typeof w> => w !== null)

  const checklist: ChecklistItem[] = scheduledWorkouts.map((workout) => ({
    workout,
    log: displayLogs.find((l) => l.workout_id === workout.id),
  }))

  async function handleToggle(item: ChecklistItem) {
    await toggleMutation.mutateAsync({
      workoutId: item.workout.id,
      isCurrentlyDone: item.log?.is_done ?? false,
      workout: item.workout,
    })
  }

  function openEdit(item: ChecklistItem) {
    const log = item.log
    setEditingId(item.workout.id)
    setEditValues((prev) => ({
      ...prev,
      [item.workout.id]: {
        sets: log?.sets?.toString() || item.workout.default_sets?.toString() || '',
        reps: log?.reps?.toString() || item.workout.default_reps?.toString() || '',
        weight: log?.weight?.toString() || '',
        distance: log?.distance?.toString() || item.workout.default_distance?.toString() || '',
        duration: log?.duration?.toString() || item.workout.default_duration?.toString() || '',
      },
    }))
  }

  function handleEditChange(workoutId: string, field: string, value: string) {
    setEditValues((prev) => ({
      ...prev,
      [workoutId]: { ...(prev[workoutId] || {}), [field]: value },
    }))
  }

  async function handleSaveEdit(item: ChecklistItem) {
    const vals = editValues[item.workout.id] || {}
    const isLift = item.workout.type === 'lift'
    await upsertMutation.mutateAsync({
      workout_id: item.workout.id,
      sets: isLift && vals.sets ? parseInt(vals.sets) : undefined,
      reps: isLift && vals.reps ? parseInt(vals.reps) : undefined,
      weight: isLift && vals.weight ? parseFloat(vals.weight) : undefined,
      distance: !isLift && vals.distance ? parseFloat(vals.distance) : undefined,
      duration: !isLift && vals.duration ? parseInt(vals.duration) : undefined,
      is_done: item.log?.is_done ?? true,
    })
    setEditingId(null)
  }

  const total = checklist.length
  const done = checklist.filter((item) => item.log?.is_done).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Workout Hari Ini</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Checklist ({done}/{total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {total === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada jadwal workout hari ini.</p>
              <p className="text-sm text-gray-400 mt-1">
                Buat workout dan atur jadwalnya di menu Workout.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {checklist.map((item) => {
                const isEditing = editingId === item.workout.id
                const vals = editValues[item.workout.id] || {}
                return (
                  <div key={item.workout.id} className="py-3">
                    <div className="flex items-start gap-3">
                      <button onClick={() => handleToggle(item)} className="mt-0.5 shrink-0">
                        {item.log?.is_done ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-300 hover:text-green-400 transition-colors" />
                        )}
                      </button>
                      <button onClick={() => openEdit(item)} className="flex-1 min-w-0 text-left">
                        <p className={`font-medium ${item.log?.is_done ? 'line-through text-gray-400' : ''}`}>
                          {item.workout.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {formatDetail(item)}
                        </p>
                      </button>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 mt-1 ${item.workout.type === 'cardio' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.workout.type === 'cardio' ? 'Cardio' : 'Lift'}
                      </span>
                      <button onClick={() => isEditing ? setEditingId(null) : openEdit(item)} className="shrink-0 mt-1 p-1">
                        {isEditing ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>

                    {isEditing && (
                      <div className="ml-9 mt-2 border rounded-lg p-3 bg-gray-50 space-y-2">
                        {item.workout.type === 'lift' ? (
                          <div className="grid grid-cols-3 gap-2">
                            <Input
                              label="Sets"
                              type="number"
                              min="1"
                              value={vals.sets || ''}
                              onChange={(e) => handleEditChange(item.workout.id, 'sets', e.target.value)}
                            />
                            <Input
                              label="Reps"
                              type="number"
                              min="1"
                              value={vals.reps || ''}
                              onChange={(e) => handleEditChange(item.workout.id, 'reps', e.target.value)}
                            />
                            <Input
                              label="Kg"
                              type="number"
                              step="0.5"
                              min="0"
                              value={vals.weight || ''}
                              onChange={(e) => handleEditChange(item.workout.id, 'weight', e.target.value)}
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              label="Jarak (m)"
                              type="number"
                              min="0"
                              value={vals.distance || ''}
                              onChange={(e) => handleEditChange(item.workout.id, 'distance', e.target.value)}
                            />
                            <Input
                              label="Durasi (menit)"
                              type="number"
                              min="1"
                              value={vals.duration || ''}
                              onChange={(e) => handleEditChange(item.workout.id, 'duration', e.target.value)}
                            />
                          </div>
                        )}
                        <div className="flex justify-end gap-2 pt-1">
                          <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                            Batal
                          </Button>
                          <Button size="sm" onClick={() => handleSaveEdit(item)} loading={upsertMutation.isPending}>
                            Simpan
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
