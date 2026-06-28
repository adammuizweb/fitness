'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogFooter } from '@/components/ui/dialog'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { WorkoutForm } from '@/components/workouts/WorkoutForm'
import { useWorkouts, useUpdateWorkoutWithSchedule, useToggleWorkoutActive, useDeleteWorkout } from '@/hooks/useWorkouts'
import { useSchedules } from '@/hooks/useSchedules'
import { EyeOff, Eye, Trash2, AlertTriangle } from 'lucide-react'

export default function EditWorkoutPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: workouts, isLoading: workoutsLoading } = useWorkouts()
  const { data: schedules, isLoading: schedulesLoading } = useSchedules()
  const updateMutation = useUpdateWorkoutWithSchedule(id)
  const toggleActiveMutation = useToggleWorkoutActive()
  const deleteMutation = useDeleteWorkout()
  const [showDelete, setShowDelete] = useState(false)

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

  async function handleDelete() {
    if (!workout) return
    await deleteMutation.mutateAsync(workout.id)
    router.push('/dashboard/workouts')
    router.refresh()
  }

  if (workoutsLoading || schedulesLoading || !workout) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[
          { label: 'Workouts', href: '/dashboard/workouts' },
          { label: 'Edit Workout' },
        ]} />
        <div className="text-center py-12 text-gray-500">Memuat...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Workouts', href: '/dashboard/workouts' },
        { label: workout.name },
      ]} />

      <div>
        <h1 className="text-2xl font-bold">Edit Workout</h1>
        <p className="text-gray-500 text-sm mt-1">Ubah detail workout, jadwal, atau nonaktifkan</p>
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

      <Card className="border-red-200 bg-red-50/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h3 className="font-semibold text-red-700 text-sm">Area Berbahaya</h3>
          </div>
          <p className="text-sm text-red-600 mb-4">
            Nonaktifkan workout untuk menyembunyikannya dari jadwal tanpa menghapus history log.
            Hapus permanen akan menghilangkan semua data workout ini.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleToggleActive}
              loading={toggleActiveMutation.isPending}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              {workout.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {workout.is_active ? 'Nonaktifkan' : 'Aktifkan'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="w-4 h-4" />
              Hapus
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Hapus Workout Permanen"
        description={`Yakin ingin menghapus "${workout.name}"? Semua jadwal dan log workout ini akan hilang.`}
      >
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDelete(false)}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleteMutation.isPending}>
            Hapus Permanen
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
