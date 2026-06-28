'use client'

import { useParams, useRouter } from 'next/navigation'
import { WorkoutForm } from '@/components/workouts/WorkoutForm'
import { useWorkouts, useUpdateWorkoutWithSchedule } from '@/hooks/useWorkouts'
import { useSchedules } from '@/hooks/useSchedules'

export default function EditWorkoutPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: workouts, isLoading: workoutsLoading } = useWorkouts()
  const { data: schedules, isLoading: schedulesLoading } = useSchedules()
  const mutation = useUpdateWorkoutWithSchedule(id)

  const workout = workouts?.find((w) => w.id === id)
  const scheduleDays = schedules
    ?.filter((s) => s.workout_id === id)
    .map((s) => s.day_of_week) || []

  async function handleSubmit(data: Parameters<typeof mutation.mutateAsync>[0]) {
    await mutation.mutateAsync(data)
    router.push('/dashboard/workouts')
    router.refresh()
  }

  if (workoutsLoading || schedulesLoading || !workout) {
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
          schedule_days: scheduleDays,
        }}
        onSubmit={handleSubmit}
        loading={mutation.isPending}
      />
    </div>
  )
}
