'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { WorkoutInput, WorkoutType } from '@/types'

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu']

interface Props {
  defaultValues?: Partial<WorkoutInput> & { schedule_days?: number[] }
  onSubmit: (data: WorkoutInput & { schedule_days: number[] }) => Promise<void>
  loading: boolean
}

export function WorkoutForm({ defaultValues, onSubmit, loading }: Props) {
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
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Nama workout wajib diisi')
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
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <Input
            id="name"
            label="Nama Workout"
            placeholder="Contoh: Dumbbell Curl"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error}
            required
          />

          <div>
            <label className="block text-sm font-medium mb-1">Tipe Workout</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="lift"
                  checked={type === 'lift'}
                  onChange={() => setType('lift')}
                  className="accent-green-600"
                />
                <span className="text-sm">Angkat Beban</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="cardio"
                  checked={type === 'cardio'}
                  onChange={() => setType('cardio')}
                  className="accent-green-600"
                />
                <span className="text-sm">Cardio</span>
              </label>
            </div>
          </div>

          {type === 'lift' && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="default_sets"
                label="Default Sets"
                type="number"
                min="1"
                placeholder="3"
                value={defaultSets}
                onChange={(e) => setDefaultSets(e.target.value)}
              />
              <Input
                id="default_reps"
                label="Default Reps"
                type="number"
                min="1"
                placeholder="10"
                value={defaultReps}
                onChange={(e) => setDefaultReps(e.target.value)}
              />
            </div>
          )}

          {type === 'cardio' && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="default_distance"
                label="Jarak (meter)"
                type="number"
                min="0"
                placeholder="200"
                value={defaultDistance}
                onChange={(e) => setDefaultDistance(e.target.value)}
              />
              <Input
                id="default_duration"
                label="Durasi (menit)"
                type="number"
                min="1"
                placeholder="10"
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(e.target.value)}
              />
            </div>
          )}

          <Input
            id="desc"
            label="Deskripsi (opsional)"
            placeholder="Catatan tentang workout ini"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium mb-2">Jadwal Mingguan</label>
            <div className="flex flex-wrap gap-2">
              {DAY_NAMES.map((name, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    scheduleDays.includes(i)
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" loading={loading}>
              Simpan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
