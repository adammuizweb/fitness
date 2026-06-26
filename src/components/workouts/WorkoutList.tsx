'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogFooter } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Dumbbell, Heart } from 'lucide-react'
import { useWorkouts, useDeleteWorkout } from '@/hooks/useWorkouts'
import type { Workout } from '@/types'

interface Props {
  workouts: Workout[]
}

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export function WorkoutList({ workouts: initialWorkouts }: Props) {
  const [workouts, setWorkouts] = useState(initialWorkouts)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const router = useRouter()

  const deleteMutation = useDeleteWorkout()

  async function handleDelete() {
    if (!deleteId) return
    await deleteMutation.mutateAsync(deleteId)
    setWorkouts((prev) => prev.filter((w) => w.id !== deleteId))
    setDeleteId(null)
    router.refresh()
  }

  if (workouts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          <p>Belum ada workout. Tambahkan workout pertamamu!</p>
          <Link href="/dashboard/workouts/new">
            <Button className="mt-4">
              <Plus className="w-4 h-4" />
              Tambah Workout
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Link href="/dashboard/workouts/new">
        <Button>
          <Plus className="w-4 h-4" />
          Tambah Workout
        </Button>
      </Link>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {workouts.map((workout) => (
          <Card key={workout.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">{workout.name}</h3>
                    <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded-full ${workout.type === 'lift' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                      {workout.type === 'lift' ? 'Beban' : 'Cardio'}
                    </span>
                  </div>
                  {workout.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{workout.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    {workout.type === 'lift' && workout.default_sets && workout.default_reps && (
                      <span>{workout.default_sets} × {workout.default_reps}</span>
                    )}
                    {workout.type === 'cardio' && workout.default_distance && (
                      <span>{workout.default_distance}m</span>
                    )}
                    {workout.type === 'cardio' && workout.default_duration && (
                      <span>{workout.default_duration}menit</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 ml-2 shrink-0">
                  <Link href={`/dashboard/workouts/${workout.id}/edit`}>
                    <Button variant="ghost" size="icon">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(workout.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Hapus Workout"
        description="Apakah kamu yakin ingin menghapus workout ini? Semua jadwal dan log terkait juga akan dihapus."
      >
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleteMutation.isPending}>
            Hapus
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
