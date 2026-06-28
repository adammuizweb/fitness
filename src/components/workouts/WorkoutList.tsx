'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogFooter } from '@/components/ui/dialog'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useI18n } from '@/lib/i18n/context'
import { Plus, Pencil, Trash2, EyeOff, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { useWorkouts, useDeleteWorkout, useToggleWorkoutActive } from '@/hooks/useWorkouts'
import { useSchedules } from '@/hooks/useSchedules'
import { Skeleton } from '@/components/ui/Skeleton'

const PER_PAGE = 12

type TypeFilter = 'all' | 'lift' | 'cardio'
type ActiveFilter = 'all' | 'active' | 'inactive'

export function WorkoutList() {
  const { t, days } = useI18n()
  const { data: workouts = [], isLoading } = useWorkouts()
  const { data: schedules = [] } = useSchedules()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [dayFilter, setDayFilter] = useState<number | null>(null)
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('active')
  const [page, setPage] = useState(1)

  const deleteMutation = useDeleteWorkout()
  const toggleActiveMutation = useToggleWorkoutActive()

  const scheduleDays = useMemo(() => {
    const map = new Map<string, number[]>()
    for (const s of schedules) {
      const days = map.get(s.workout_id) || []
      days.push(s.day_of_week)
      map.set(s.workout_id, days)
    }
    return map
  }, [schedules])

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
        const wdays = scheduleDays.get(w.id)
        return wdays?.includes(dayFilter)
      })
    }

    return result
  }, [workouts, typeFilter, dayFilter, activeFilter, scheduleDays])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  async function handleDelete() {
    if (!deleteId) return
    await deleteMutation.mutateAsync(deleteId)
    setDeleteId(null)
  }

  async function handleToggleActive(workout: { id: string; is_active: boolean }) {
    const newActive = !workout.is_active
    await toggleActiveMutation.mutateAsync({ id: workout.id, is_active: newActive })
  }

  if (isLoading) {
    return <WorkoutListSkeleton />
  }

  if (workouts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          <p>{t('workoutList.empty')}</p>
          <Link href="/dashboard/workouts/new">
            <Button className="mt-4">
              <Plus className="w-4 h-4" />
              {t('workoutList.addBtn')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: t('nav.workouts') },
      ]} />
      <div>
        <h1 className="text-2xl font-bold">{t('workout.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('workout.subtitle')}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard/workouts/new">
          <Button>
            <Plus className="w-4 h-4" />
            {t('workoutList.addBtn')}
          </Button>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activeFilter}
            onChange={(e) => { setActiveFilter(e.target.value as ActiveFilter); setPage(1) }}
            className="text-sm border rounded-lg px-2 py-1.5 bg-white text-gray-700"
          >
            <option value="active">{t('workoutList.filterActive')}</option>
            <option value="inactive">{t('workoutList.filterInactive')}</option>
            <option value="all">{t('workoutList.filterAll')}</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as TypeFilter); setPage(1) }}
            className="text-sm border rounded-lg px-2 py-1.5 bg-white text-gray-700"
          >
            <option value="all">{t('workoutList.filterAllTypes')}</option>
            <option value="lift">{t('workoutList.filterLift')}</option>
            <option value="cardio">{t('workoutList.filterCardio')}</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => { setDayFilter(null); setPage(1) }}
          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${dayFilter === null ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}
        >
          {t('workoutList.filterAllDays')}
        </button>
        {days.short.map((name, i) => (
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
            {t('workoutList.noResults')}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((workout) => {
              const wdays = scheduleDays.get(workout.id)
              return (
                <Card key={workout.id} className={workout.is_active ? '' : 'opacity-60'}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{workout.name}</h3>
                          <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded-full ${workout.type === 'lift' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {workout.type === 'lift' ? t('workoutList.typeLift') : t('workoutList.typeCardio')}
                          </span>
                          {!workout.is_active && (
                            <span className="shrink-0 text-xs px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-500">
                              {t('workoutList.inactive')}
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
                        {wdays && wdays.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {days.short.map((name, i) => (
                              <span
                                key={i}
                                className={`text-xs px-1.5 py-0.5 rounded ${wdays.includes(i) ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-300'}`}
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
        title={t('workoutListDelete.title')}
        description={t('workoutListDelete.desc')}
      >
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleteMutation.isPending}>
            {t('common.delete')}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}

function WorkoutListSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-48 mb-4" />
      <Skeleton className="h-7 w-48 mb-2" />
      <Skeleton className="h-4 w-64 mb-6" />

      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-10 w-28 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      <div className="flex gap-1.5 mb-4">
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="h-7 w-14 rounded-full" />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-48 mb-3" />
                <div className="flex gap-1 mb-2">
                  {[...Array(7)].map((_, j) => (
                    <Skeleton key={j} className="h-5 w-7 rounded" />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1 ml-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
