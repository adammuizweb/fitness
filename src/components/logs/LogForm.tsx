'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useI18n } from '@/lib/i18n/context'
import { useUpsertLog } from '@/hooks/useLogs'
import type { Workout } from '@/types'

interface Props {
  workouts: Workout[]
}

export function LogForm({ workouts }: Props) {
  const { t } = useI18n()
  const [workoutId, setWorkoutId] = useState('')
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')
  const mutation = useUpsertLog()

  const selectedWorkout = workouts.find((w) => w.id === workoutId)
  const isLift = selectedWorkout?.type === 'lift'

  function handleWorkoutChange(value: string) {
    setWorkoutId(value)
    const w = workouts.find((x) => x.id === value)
    if (w) {
      if (w.type === 'lift') {
        setSets(w.default_sets?.toString() || '')
        setReps(w.default_reps?.toString() || '')
        setDistance('')
        setDuration('')
      } else {
        setDistance(w.default_distance?.toString() || '')
        setDuration(w.default_duration?.toString() || '')
        setSets('')
        setReps('')
        setWeight('')
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!workoutId) return

    await mutation.mutateAsync({
      workout_id: workoutId,
      sets: isLift && sets ? parseInt(sets) : undefined,
      reps: isLift && reps ? parseInt(reps) : undefined,
      weight: isLift && weight ? parseFloat(weight) : undefined,
      distance: !isLift && distance ? parseFloat(distance) : undefined,
      duration: !isLift && duration ? parseInt(duration) : undefined,
      notes: notes || undefined,
      is_done: true,
    })

    setWorkoutId('')
    setSets('')
    setReps('')
    setWeight('')
    setDistance('')
    setDuration('')
    setNotes('')
  }

  if (workouts.length === 0) {
    return <p className="text-sm text-gray-500 py-4 text-center">{t('logForm.allLogged')}</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        id="workout"
        label={t('logForm.selectWorkout')}
        placeholder={t('logForm.selectPlaceholder')}
        options={workouts.map((w) => ({
          value: w.id,
          label: `${w.name} (${w.type === 'lift' ? t('workoutList.typeLift') : t('workoutList.typeCardio')})`,
        }))}
        value={workoutId}
        onChange={(e) => handleWorkoutChange(e.target.value)}
        required
      />

      {selectedWorkout && selectedWorkout.type === 'lift' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="sets"
              label={t('logForm.sets')}
              type="number"
              min="1"
              placeholder="3"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              required
            />
            <Input
              id="reps"
              label={t('logForm.reps')}
              type="number"
              min="1"
              placeholder="12"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              required
            />
          </div>
          <Input
            id="weight"
            label={t('logForm.weight')}
            type="number"
            step="0.5"
            min="0"
            placeholder="5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </>
      )}

      {selectedWorkout && selectedWorkout.type === 'cardio' && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="distance"
            label={t('logForm.distance')}
            type="number"
            min="0"
            placeholder="200"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            required
          />
          <Input
            id="duration"
            label={t('logForm.duration')}
            type="number"
            min="1"
            placeholder="10"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>
      )}

      <Input
        id="notes"
        label={t('logForm.notes')}
        placeholder={t('logForm.notesPlaceholder')}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {selectedWorkout && (
        <Button type="submit" className="w-full" loading={mutation.isPending}>
          {t('logForm.submit')}
        </Button>
      )}
    </form>
  )
}
