'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useUpsertLog } from '@/hooks/useLogs'
import type { Exercise } from '@/types'

interface Props {
  exercises: Exercise[]
  onSelectExercise: (id: string) => void
}

export function LogForm({ exercises, onSelectExercise }: Props) {
  const [exerciseId, setExerciseId] = useState('')
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  const router = useRouter()

  const mutation = useUpsertLog()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!exerciseId) return

    await mutation.mutateAsync({
      exercise_id: exerciseId,
      sets: parseInt(sets),
      reps: parseInt(reps),
      weight: weight ? parseFloat(weight) : undefined,
      notes: notes || undefined,
    })

    setExerciseId('')
    setSets('')
    setReps('')
    setWeight('')
    setNotes('')
    onSelectExercise('')
    router.refresh()
  }

  if (exercises.length === 0) {
    return <p className="text-sm text-gray-500">Semua exercise sudah di-log hari ini!</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        id="exercise"
        label="Pilih Exercise"
        placeholder="Pilih exercise..."
        options={exercises.map((ex) => ({ value: ex.id, label: ex.name }))}
        value={exerciseId}
        onChange={(e) => {
          setExerciseId(e.target.value)
          onSelectExercise(e.target.value)
        }}
        required
      />

      {exerciseId && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="sets"
              label="Sets"
              type="number"
              min="1"
              placeholder="3"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              required
            />
            <Input
              id="reps"
              label="Reps"
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
            label="Beban (kg) — opsional"
            type="number"
            step="0.5"
            min="0"
            placeholder="5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />

          <Input
            id="notes"
            label="Catatan — opsional"
            placeholder="Misal: rasa di otot bagus"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Button type="submit" className="w-full" loading={mutation.isPending}>
            Simpan Log
          </Button>
        </>
      )}
    </form>
  )
}
