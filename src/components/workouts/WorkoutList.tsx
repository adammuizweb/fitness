'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogFooter } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, EyeOff, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDeleteWorkout, useToggleWorkoutActive } from '@/hooks/useWorkouts'
import type { Workout } from '@/types'

interface Props {
  workouts: Workout[]
  scheduleDays?: Map<string, number[]>
}

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const PER_PAGE = 12

type TypeFilter = 'all' | 'lift' | 'cardio'
type ActiveFilter = 'all' | 'active' | 'inactive'

export function WorkoutList({ workouts: initialWorkouts, scheduleDays }: Props) {
  const [workouts, setWorkouts] = useState(initialWorkouts)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [dayFilter, setDayFilter] = useState<number | null>(null)
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('active')
  const [page, setPage] = useState(1)
  const router = useRouter()

  const deleteMutation = useDeleteWorkout()
  const toggleActiveMutation = useToggleWorkoutActive()

  const filtered = useMemo(() => {
    let result = workouts

    if (typeFilter !== 'all') {
      result = result.filter((w) => w.type === typeFilter)
    }

    if (activeFilter === 'active') {
      result = result.filter((w) => w.is_active)
    } else if (activeFilter === 'inactive') {
      result = result.filter((w) => !w.is_active)
    }

    if (dayFilter !== null) {
      result = result.filter((w) => {
        const days = scheduleDays?.get(w.id)
        return days?.includes(dayFilter)
      })
    }

    return result
  }, [workouts, typeFilter, dayFilter, activeFilter, scheduleDays])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  async function handleDelete() {
    if (!deleteId) return
    await deleteMutation.mutateAsync(deleteId)
    setWorkouts((prev) => prev.filter((w) => w.id !== deleteId))
    setDeleteId(null)
    router.refresh()
  }

  async function handleToggleActive(workout: Workout) {
    const newActive = !workout.is_active
    await toggleActiveMutation.mutateAsync({ id: workout.id, is_active: newActive })
    setWorkouts((prev) => prev.map((w) => (w.id === workout.id ? { ...w, is_active: newActive } : w)))
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard/workouts/new">
          <Button>
            <Plus className="w-4 h-4" />
            Tambah Workout
          </Button>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activeFilter}
            onChange={(e) => { setActiveFilter(e.target.value as ActiveFilter); setPage(1) }}
            className="text-sm border rounded-lg px-2 py-1.5 bg-white text-gray-700"
          >
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
            <option value="all">Semua</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as TypeFilter); setPage(1) }}
            className="text-sm border rounded-lg px-2 py-1.5 bg-white text-gray-700"
          >
            <option value="all">Semua Tipe</option>
            <option value="lift">Beban</option>
            <option value="cardio">Cardio</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => { setDayFilter(null); setPage(1) }}
          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${dayFilter === null ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}
        >
          Semua Hari
        </button>
        {DAY_NAMES.map((name, i) => (
          <button
            key={i}
            onClick={() => { setDayFilter(dayFilter === i ? null : i); setPage(1) }}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${dayFilter === i ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'}`}
          >
            {name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            Tidak ada workout dengan filter ini.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((workout) => {
              const days = scheduleDays?.get(workout.id)
              return (
                <Card key={workout.id} className={workout.is_active ? '' : 'opacity-60'}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{workout.name}</h3>
                          <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded-full ${workout.type === 'lift' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {workout.type === 'lift' ? 'Beban' : 'Cardio'}
                          </span>
                          {!workout.is_active && (
                            <span className="shrink-0 text-xs px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-500">
                              Nonaktif
                            </span>
                          )}
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
                        {days && days.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {DAY_NAMES.map((name, i) => (
                              <span
                                key={i}
                                className={`text-xs px-1.5 py-0.5 rounded ${days.includes(i) ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-300'}`}
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 ml-2 shrink-0">
                        <Link href={`/dashboard/workouts/${workout.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => handleToggleActive(workout)}>
                          {workout.is_active ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4 text-green-500" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(workout.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded border disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 text-sm rounded border ${p === page ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded border disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Hapus Workout"
        description="Apakah kamu yakin ingin menghapus workout ini? Semua jadwal dan log terkait JUGA AKAN DIHAPUS. Gunakan Nonaktifkan jika ingin menyimpan history."
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
