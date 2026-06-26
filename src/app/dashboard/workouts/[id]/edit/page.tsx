'use client'

import { useParams, useRouter } from 'next/navigation'
import { WorkoutForm } from '@/components/workouts/WorkoutForm'
import { useWorkouts, useUpdateWorkout } from '@/hooks/useWorkouts'

export default function EditWorkoutPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: workouts, isLoading } = useWorkouts()
  const mutation = useUpdateWorkout(id)

  const workout = workouts?.find((w) => w.id === id)

  async function handleSubmit(data: Parameters<typeof mutation.mutateAsync>[0]) {
    await mutation.mutateAsync(data)
    router.push('/dashboard/workouts')
    router.refresh()
  }

  if (isLoading || !workout) {
    return <div className="text-center py-8 text-gray-500">Memuat...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Workout</h1>
        <p className="text-gray-500 text-sm mt-1">Ubah detail workout</p>
      </div>
      <WorkoutForm
        defaultValues={{
          name: workout.name,
          description: workout.description || '',
          type: workout.type,
          default_sets: workout.default_sets || undefined,
          default_reps: workout.default_reps || undefined,
          default_distance: workout.default_distance || undefined,
          default_duration: workout.default_duration || undefined,
        }}
        onSubmit={handleSubmit}
        loading={mutation.isPending}
      />
    </div>
  )
}
