'use client'

import { useState, useMemo } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import { useCreatePlan } from '@/hooks/useSharedPlans'
import { useRestDays } from '@/hooks/useRestDays'
import { Calendar, Globe } from 'lucide-react'
import type { WorkoutSchedule } from '@/types'

interface Props {
  schedules: WorkoutSchedule[]
  open: boolean
  onClose: () => void
}

export function SharePlanDialog({ schedules, open, onClose }: Props) {
  const { t, days } = useI18n()
  const createMutation = useCreatePlan()
  const { data: restDays = [] } = useRestDays()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const planDays = useMemo(() => {
    const dayMap: Record<number, { name: string; type: string; sets: number | null; reps: number | null; distance: number | null; duration: number | null }[]> = {}
    for (const s of schedules) {
      if (!s.workout) continue
      if (!dayMap[s.day_of_week]) dayMap[s.day_of_week] = []
      dayMap[s.day_of_week].push({
        name: s.workout.name,
        type: s.workout.type,
        sets: s.workout.default_sets,
        reps: s.workout.default_reps,
        distance: s.workout.default_distance,
        duration: s.workout.default_duration,
      })
    }
    return dayMap
  }, [schedules])

  const hasContent = Object.keys(planDays).length > 0 || restDays.length > 0

  async function handleShare() {
    if (!name.trim()) return

    const daysInput: {
      day_of_week: number
      workout_name: string
      workout_type: 'lift' | 'cardio'
      default_sets?: number | null
      default_reps?: number | null
      default_distance?: number | null
      default_duration?: number | null
      is_rest?: boolean
    }[] = []

    // Add workout days
    for (const [dayStr, workouts] of Object.entries(planDays)) {
      const day = parseInt(dayStr)
      for (const w of workouts) {
        daysInput.push({
          day_of_week: day,
          workout_name: w.name,
          workout_type: w.type as 'lift' | 'cardio',
          default_sets: w.sets,
          default_reps: w.reps,
          default_distance: w.distance,
          default_duration: w.duration,
        })
      }
    }

    // Add rest days
    for (const r of restDays) {
      if (!planDays[r.day_of_week]) {
        daysInput.push({
          day_of_week: r.day_of_week,
          workout_name: 'Rest Day',
          workout_type: 'cardio',
          is_rest: true,
        })
      }
    }

    await createMutation.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      days: daysInput,
    })
    setName('')
    setDescription('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title="Share Weekly Plan">
      <div className="space-y-4">
        <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3">
          <Calendar className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">Your full weekly schedule</p>
            <p className="text-xs text-green-600">
              {Object.keys(planDays).length} workout days{restDays.length > 0 ? ` + ${restDays.length} rest days` : ''}
            </p>
          </div>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Plan name (e.g. Push/Pull/Legs)"
          className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className="w-full rounded-lg border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {hasContent && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
            {days.long.map((dayName, i) => {
              const workouts = planDays[i]
              const isRest = restDays.some(r => r.day_of_week === i)
              const label = isRest ? 'Rest' : workouts?.map(w => w.name).join(', ')
              if (!label) return null
              return (
                <div key={i} className="text-sm flex gap-2">
                  <span className="font-medium text-gray-600 w-24 shrink-0">{dayName}</span>
                  <span className="text-gray-500">{label}</span>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleShare} loading={createMutation.isPending} disabled={!name.trim()}>
            <Globe className="w-4 h-4 mr-1" />
            Share Plan
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
