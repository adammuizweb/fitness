'use client'

import { useParams, useRouter } from 'next/navigation'
import { WorkoutForm } from '@/components/workouts/WorkoutForm'
import { useExercises, useUpdateExercise } from '@/hooks/useExercises'
import type { ExerciseInput } from '@/types'

export default function EditWorkoutPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: exercises, isLoading } = useExercises()
  const mutation = useUpdateExercise(id)

  const exercise = exercises?.find((e) => e.id === id)

  async function handleSubmit(data: ExerciseInput) {
    await mutation.mutateAsync(data)
    router.push('/workouts')
    router.refresh()
  }

  if (isLoading || !exercise) {
    return <div className="text-center py-8 text-gray-500">Memuat...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Exercise</h1>
        <p className="text-gray-500 text-sm mt-1">Ubah detail exercise</p>
      </div>
      <WorkoutForm
        defaultValues={{ name: exercise.name, description: exercise.description || '' }}
        onSubmit={handleSubmit}
        loading={mutation.isPending}
      />
    </div>
  )
}
