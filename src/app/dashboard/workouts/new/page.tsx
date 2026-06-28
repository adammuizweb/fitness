'use client'

import { useRouter } from 'next/navigation'
import { WorkoutForm } from '@/components/workouts/WorkoutForm'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useI18n } from '@/lib/i18n/context'
import { useCreateWorkoutWithSchedule } from '@/hooks/useWorkouts'

export default function NewWorkoutPage() {
  const { t } = useI18n()
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
        { label: t('nav.workouts'), href: '/dashboard/workouts' },
        { label: t('workout.breadcrumbNew') },
      ]} />
      <div>
        <h1 className="text-2xl font-bold">{t('workout.new')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('workout.newSubtitle')}</p>
      </div>
      <WorkoutForm onSubmit={handleSubmit} loading={mutation.isPending} cancelHref="/dashboard/workouts" />
    </div>
  )
}
