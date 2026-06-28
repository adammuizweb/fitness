'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useI18n } from '@/lib/i18n/context'
import { useTodayLogs, useUpsertLog, useToggleChecklistItem } from '@/hooks/useLogs'
import { useRestDays } from '@/hooks/useRestDays'
import { createClient } from '@/lib/supabase/client'
import type { WorkoutLog, WorkoutSchedule, Workout } from '@/types'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Loader2, Camera, X, Moon, Sparkles } from 'lucide-react'

interface ChecklistItem {
  workout: Workout
  log?: WorkoutLog
}

const supabase = createClient()

function formatDetail(item: ChecklistItem): string {
  const log = item.log
  if (log?.sets || log?.reps || log?.distance || log?.duration) {
    if (item.workout.type === 'cardio') {
      const parts: string[] = []
      if (log.distance) parts.push(`${log.distance} m`)
      if (log.duration) parts.push(`${log.duration} menit`)
      return parts.join(' • ')
    }
    const parts: string[] = []
    if (log.sets) parts.push(`${log.sets} set`)
    if (log.reps) parts.push(`${log.reps} rep`)
    if (log.weight) parts.push(`${log.weight} kg`)
    return parts.join(' × ')
  }
  const w = item.workout
  if (w.type === 'cardio') {
    const parts: string[] = []
    if (w.default_distance) parts.push(`${w.default_distance} m`)
    if (w.default_duration) parts.push(`${w.default_duration} menit`)
    return parts.join(' • ') || ''
  }
  const parts: string[] = []
  if (w.default_sets) parts.push(`${w.default_sets} set`)
  if (w.default_reps) parts.push(`${w.default_reps} rep`)
  return parts.join(' × ') || ''
}

export function LogPageClient() {
  const { t } = useI18n()
  const todayDayOfWeek = new Date().getDay()

  const { data: logs, isLoading: logsLoading } = useTodayLogs()
  const { data: restDays = [] } = useRestDays()
  const isRestDay = restDays.some(r => r.day_of_week === todayDayOfWeek) && (logs?.length ?? 0) === 0
  const toggleMutation = useToggleChecklistItem()
  const upsertMutation = useUpsertLog()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, Record<string, string>>>({})
  const [schedules, setSchedules] = useState<WorkoutSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('workout_schedules')
        .select('*, workout:workouts(*)')
        .eq('day_of_week', todayDayOfWeek)
      setSchedules(data || [])
      setLoading(false)
    }
    load()
  }, [todayDayOfWeek])

  const scheduledWorkouts: Workout[] = schedules
    .map((s) => s.workout)
    .filter((w): w is NonNullable<typeof w> => w !== null)

  const displayLogs = logs || []

  const checklist: ChecklistItem[] = scheduledWorkouts.map((workout) => ({
    workout,
    log: displayLogs.find((l) => l.workout_id === workout.id),
  }))

  const handleToggle = useCallback(async (item: ChecklistItem) => {
    await toggleMutation.mutateAsync({
      workoutId: item.workout.id,
      isCurrentlyDone: item.log?.is_done ?? false,
      workout: item.workout,
    })
  }, [toggleMutation])

  function openEdit(item: ChecklistItem) {
    const log = item.log
    setEditingId(item.workout.id)
    setEditValues((prev) => ({
      ...prev,
      [item.workout.id]: {
        sets: log?.sets?.toString() || item.workout.default_sets?.toString() || '',
        reps: log?.reps?.toString() || item.workout.default_reps?.toString() || '',
        weight: log?.weight?.toString() || '',
        distance: log?.distance?.toString() || item.workout.default_distance?.toString() || '',
        duration: log?.duration?.toString() || item.workout.default_duration?.toString() || '',
      },
    }))
  }

  function handleEditChange(workoutId: string, field: string, value: string) {
    setEditValues((prev) => ({
      ...prev,
      [workoutId]: { ...(prev[workoutId] || {}), [field]: value },
    }))
  }

  async function handleUploadPhoto(workoutId: string, files: FileList) {
    const item = checklist.find(c => c.workout.id === workoutId)
    if (!item) return

    setUploading((prev) => ({ ...prev, [workoutId]: true }))
    try {
      const { compressImage } = await import('@/lib/compressImage')

      const compressedFiles: File[] = []
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImage(files[i])
        compressedFiles.push(compressed)
      }

      const formData = new FormData()
      for (const cf of compressedFiles) {
        formData.append('file', cf)
      }

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json()
        console.error('Upload failed:', err)
        return
      }

      const data = await res.json()
      const currentPhotos = item.log?.photos || []
      await upsertMutation.mutateAsync({
        workout_id: workoutId,
        photos: [...currentPhotos, ...data.urls],
        is_done: true,
      })
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading((prev) => ({ ...prev, [workoutId]: false }))
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>, workoutId: string) {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadPhoto(workoutId, e.target.files)
    }
    e.target.value = ''
  }

  function removePhoto(workoutId: string, photoUrl: string) {
    const item = checklist.find(c => c.workout.id === workoutId)
    if (!item) return
    const currentPhotos = item.log?.photos || []
    upsertMutation.mutateAsync({
      workout_id: workoutId,
      photos: currentPhotos.filter(u => u !== photoUrl),
      is_done: item.log?.is_done ?? true,
    })
  }

  async function handleSaveEdit(item: ChecklistItem) {
    const vals = editValues[item.workout.id] || {}
    const isLift = item.workout.type === 'lift'
    await upsertMutation.mutateAsync({
      workout_id: item.workout.id,
      sets: isLift && vals.sets ? parseInt(vals.sets) : undefined,
      reps: isLift && vals.reps ? parseInt(vals.reps) : undefined,
      weight: isLift && vals.weight ? parseFloat(vals.weight) : undefined,
      distance: !isLift && vals.distance ? parseFloat(vals.distance) : undefined,
      duration: !isLift && vals.duration ? parseInt(vals.duration) : undefined,
      is_done: item.log?.is_done ?? true,
    })
    setEditingId(null)
  }

  const total = checklist.length
  const done = checklist.filter((item) => item.log?.is_done).length

  if (loading || logsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: t('nav.log'), href: '/dashboard/log' },
        { label: t('log.today') },
      ]} />
      <div>
        <h1 className="text-2xl font-bold">{t('log.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {isRestDay ? (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-8 text-center">
            <Moon className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-indigo-700">Rest Day</h2>
            <p className="text-indigo-500 mt-1">Take a break, recover, and come back stronger tomorrow!</p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <span>Recovery is part of the progress</span>
            </div>
          </CardContent>
        </Card>
      ) : (
      <Card>
        <CardHeader>
          <CardTitle>
            {t('log.checklist', { done, total })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {total === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('log.noSchedule')}</p>
              <p className="text-sm text-gray-400 mt-1">
                {t('log.noScheduleHint')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {checklist.map((item) => {
                const isEditing = editingId === item.workout.id
                const vals = editValues[item.workout.id] || {}
                const photos = item.log?.photos || []
                return (
                  <div key={item.workout.id} className="py-3">
                    <div className="flex items-start gap-3">
                      <button onClick={() => handleToggle(item)} className="mt-0.5 shrink-0">
                        {item.log?.is_done ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-300 hover:text-green-400 transition-colors" />
                        )}
                      </button>
                      <button onClick={() => openEdit(item)} className="flex-1 min-w-0 text-left">
                        <p className={`font-medium ${item.log?.is_done ? 'line-through text-gray-400' : ''}`}>
                          {item.workout.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {formatDetail(item)}
                        </p>
                        {(item.log?.photos?.length ?? 0) > 0 && (
                          <div className="flex gap-1 mt-2">
                            {item.log!.photos.slice(0, 4).map((url) => (
                              <img key={url} src={url} alt="" className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                            ))}
                            {item.log!.photos.length > 4 && (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium border border-gray-200">
                                +{item.log!.photos.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 mt-1 ${item.workout.type === 'cardio' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.workout.type === 'cardio' ? t('log.cardio') : t('log.lift')}
                      </span>
                      <button onClick={() => isEditing ? setEditingId(null) : openEdit(item)} className="shrink-0 mt-1 p-1">
                        {isEditing ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>

                    {/* Always-visible camera button + photo indicator */}
                    <div className="ml-9 mt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          multiple
                          className="hidden"
                          id={`photo-input-${item.workout.id}`}
                          onChange={(e) => handleFileSelect(e, item.workout.id)}
                        />
                        <label
                          htmlFor={`photo-input-${item.workout.id}`}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-green-600 cursor-pointer transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          {photos.length > 0 ? (
                            <span>{photos.length} {t('log.photos')}</span>
                          ) : (
                            <span>{t('log.addPhoto')}</span>
                          )}
                        </label>
                        {photos.length > 0 && (
                          <button
                            onClick={() => openEdit(item)}
                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {t('log.managePhotos')}
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="ml-9 mt-1 border rounded-lg p-3 bg-gray-50 space-y-2">
                        {item.workout.type === 'lift' ? (
                          <div className="grid grid-cols-3 gap-2">
                            <Input
                              label={t('log.sets')}
                              type="number"
                              min="1"
                              value={vals.sets || ''}
                              onChange={(e) => handleEditChange(item.workout.id, 'sets', e.target.value)}
                            />
                            <Input
                              label={t('log.reps')}
                              type="number"
                              min="1"
                              value={vals.reps || ''}
                              onChange={(e) => handleEditChange(item.workout.id, 'reps', e.target.value)}
                            />
                            <Input
                              label={t('log.weight')}
                              type="number"
                              step="0.5"
                              min="0"
                              value={vals.weight || ''}
                              onChange={(e) => handleEditChange(item.workout.id, 'weight', e.target.value)}
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              label={t('log.distance')}
                              type="number"
                              min="0"
                              value={vals.distance || ''}
                              onChange={(e) => handleEditChange(item.workout.id, 'distance', e.target.value)}
                            />
                            <Input
                              label={t('log.duration')}
                              type="number"
                              min="1"
                              value={vals.duration || ''}
                              onChange={(e) => handleEditChange(item.workout.id, 'duration', e.target.value)}
                            />
                          </div>
                        )}

                          <div className="border-t pt-2 space-y-2">
                          {photos.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {photos.map((url) => (
                                <div key={url} className="relative">
                                  <img
                                    src={url}
                                    alt=""
                                    className="w-20 h-20 object-cover rounded-lg"
                                  />
                                  <button
                                    onClick={() => removePhoto(item.workout.id, url)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div>
                            <label
                              htmlFor={`photo-input-${item.workout.id}`}
                              className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 cursor-pointer font-medium"
                            >
                              <Camera className="w-4 h-4" />
                              {photos.length > 0 ? t('log.addMore') : t('log.photo')}
                            </label>
                            {uploading[item.workout.id] && (
                              <span className="ml-2 text-xs text-gray-400">Uploading...</span>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                            {t('log.cancel')}
                          </Button>
                          <Button size="sm" onClick={() => handleSaveEdit(item)} loading={upsertMutation.isPending}>
                            {t('log.save')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  )
}
