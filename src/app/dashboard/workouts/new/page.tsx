'use client'

import { useRouter } from 'next/navigation'
import { WorkoutForm } from '@/components/workouts/WorkoutForm'
import { useCreateExercise } from '@/hooks/useExercises'
import type { ExerciseInput } from '@/types'

export default function NewWorkoutPage() {
  const router = useRouter()
  const mutation = useCreateExercise()

  async function handleSubmit(data: ExerciseInput) {
    await mutation.mutateAsync(data)
    router.push('/dashboard/workouts')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tambah Exercise</h1>
        <p className="text-gray-500 text-sm mt-1">Buat exercise baru untuk workoutmu</p>
      </div>
      <WorkoutForm onSubmit={handleSubmit} loading={mutation.isPending} />
    </div>
  )
}
