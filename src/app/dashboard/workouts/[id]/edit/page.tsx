'use client'

import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useI18n } from '@/lib/i18n/context'
import { WorkoutForm } from '@/components/workouts/WorkoutForm'
import { useWorkouts, useUpdateWorkoutWithSchedule, useToggleWorkoutActive } from '@/hooks/useWorkouts'
import { useSchedules } from '@/hooks/useSchedules'
import { EyeOff, Eye, AlertTriangle } from 'lucide-react'

export default function EditWorkoutPage() {
  const { t } = useI18n()
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: workouts, isLoading: workoutsLoading } = useWorkouts({ includeInactive: true })
  const { data: schedules, isLoading: schedulesLoading } = useSchedules()
  const updateMutation = useUpdateWorkoutWithSchedule(id)
  const toggleActiveMutation = useToggleWorkoutActive()

  const workout = workouts?.find((w) => w.id === id)
  const scheduleDays = schedules
    ?.filter((s) => s.workout_id === id)
    .map((s) => s.day_of_week) || []

  async function handleSubmit(data: Parameters<typeof updateMutation.mutateAsync>[0]) {
    await updateMutation.mutateAsync(data)
    router.push('/dashboard/workouts')
    router.refresh()
  }

  async function handleToggleActive() {
    if (!workout) return
    await toggleActiveMutation.mutateAsync({ id: workout.id, is_active: !workout.is_active })
    router.refresh()
  }

  if (workoutsLoading || schedulesLoading || !workout) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[
          { label: t('nav.workouts'), href: '/dashboard/workouts' },
          { label: t('workout.breadcrumbEdit') },
        ]} />
        <div className="text-center py-12 text-gray-500">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: t('nav.workouts'), href: '/dashboard/workouts' },
        { label: workout.name },
      ]} />

      <div>
        <h1 className="text-2xl font-bold">{t('workout.edit')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('workout.editSubtitle')}</p>
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
        loading={updateMutation.isPending}
        cancelHref="/dashboard/workouts"
      />

      <Card className="border-amber-200 bg-amber-50/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-amber-700 text-sm">{t('dangerZone.title')}</h3>
          </div>
          <p className="text-sm text-amber-700 mb-4">
            {t('dangerZone.desc')}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleToggleActive}
              loading={toggleActiveMutation.isPending}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              {workout.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {workout.is_active ? t('dangerZone.deactivate') : t('dangerZone.activate')}
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
