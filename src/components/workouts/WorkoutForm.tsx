'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/lib/i18n/context'
import { Dumbbell, Heart, Calendar } from 'lucide-react'
import type { WorkoutInput, WorkoutType } from '@/types'

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu']

interface Props {
  defaultValues?: Partial<WorkoutInput> & { schedule_days?: number[] }
  onSubmit: (data: WorkoutInput & { schedule_days: number[] }) => Promise<void>
  loading: boolean
  cancelHref?: string
}

export function WorkoutForm({ defaultValues, onSubmit, loading, cancelHref }: Props) {
  const { t } = useI18n()
  const [name, setName] = useState(defaultValues?.name || '')
  const [description, setDescription] = useState(defaultValues?.description || '')
  const [type, setType] = useState<WorkoutType>(defaultValues?.type || 'lift')
  const [defaultSets, setDefaultSets] = useState(defaultValues?.default_sets?.toString() || '')
  const [defaultReps, setDefaultReps] = useState(defaultValues?.default_reps?.toString() || '')
  const [defaultDistance, setDefaultDistance] = useState(defaultValues?.default_distance?.toString() || '')
  const [defaultDuration, setDefaultDuration] = useState(defaultValues?.default_duration?.toString() || '')
  const [scheduleDays, setScheduleDays] = useState<number[]>(defaultValues?.schedule_days || [])
  const [error, setError] = useState('')

  function toggleDay(day: number) {
    setScheduleDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError(t('workoutForm.nameRequired'))
      return
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      default_sets: type === 'lift' && defaultSets ? parseInt(defaultSets) : undefined,
      default_reps: type === 'lift' && defaultReps ? parseInt(defaultReps) : undefined,
      default_distance: type === 'cardio' && defaultDistance ? parseFloat(defaultDistance) : undefined,
      default_duration: type === 'cardio' && defaultDuration ? parseInt(defaultDuration) : undefined,
      schedule_days: scheduleDays,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
      )}

      <Input
        id="name"
        label={t('workoutForm.name')}
        placeholder={t('workoutForm.namePlaceholder')}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium mb-2">{t('workoutForm.type')}</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('lift')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
              type === 'lift'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            {t('workoutForm.liftBtn')}
          </button>
          <button
            type="button"
            onClick={() => setType('cardio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
              type === 'cardio'
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
            }`}
          >
            <Heart className="w-4 h-4" />
            {t('workoutForm.cardioBtn')}
          </button>
        </div>
      </div>

      {type === 'lift' && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              {t('workoutForm.liftSettings')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="default_sets"
                label={t('workoutForm.defaultSets')}
                type="number"
                min="1"
                placeholder="3"
                value={defaultSets}
                onChange={(e) => setDefaultSets(e.target.value)}
              />
              <Input
                id="default_reps"
                label={t('workoutForm.defaultReps')}
                type="number"
                min="1"
                placeholder="10"
                value={defaultReps}
                onChange={(e) => setDefaultReps(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {type === 'cardio' && (
        <Card className="border-orange-200 bg-orange-50/30">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium text-orange-700 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              {t('workoutForm.cardioSettings')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="default_distance"
                label={t('workoutForm.distance')}
                type="number"
                min="0"
                placeholder="200"
                value={defaultDistance}
                onChange={(e) => setDefaultDistance(e.target.value)}
              />
              <Input
                id="default_duration"
                label={t('workoutForm.duration')}
                type="number"
                min="1"
                placeholder="10"
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Input
        id="description"
        label={t('workoutForm.description')}
        placeholder={t('workoutForm.descriptionPlaceholder')}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {t('workoutForm.weeklySchedule')}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {DAY_NAMES.map((day, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleDay(i)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                scheduleDays.includes(i)
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        {cancelHref && (
          <Link href={cancelHref}>
            <Button type="button" variant="outline">{t('common.cancel')}</Button>
          </Link>
        )}
        <Button type="submit" loading={loading} className="min-w-[120px]">
          {t('workoutForm.save')}
        </Button>
      </div>
    </form>
  )
}
