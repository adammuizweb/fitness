'use client'

import { useRouter } from 'next/navigation'
import { WorkoutForm } from '@/components/workouts/WorkoutForm'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useCreateWorkoutWithSchedule } from '@/hooks/useWorkouts'

export default function NewWorkoutPage() {
  const router = useRouter()
  const mutation = useCreateWorkoutWithSchedule()

  async function handleSubmit(data: Parameters<typeof mutation.mutateAsync>[0]) {
    await mutation.mutateAsync(data)
    router.push('/dashboard/workouts')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Workouts', href: '/dashboard/workouts' },
        { label: 'Tambah Workout' },
      ]} />
      <div>
        <h1 className="text-2xl font-bold">Tambah Workout</h1>
        <p className="text-gray-500 text-sm mt-1">Buat workout baru, atur tipe dan jadwal mingguan</p>
      </div>
      <WorkoutForm onSubmit={handleSubmit} loading={mutation.isPending} cancelHref="/dashboard/workouts" />
    </div>
  )
}
