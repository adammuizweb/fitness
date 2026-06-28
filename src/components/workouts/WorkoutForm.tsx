'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dumbbell, Heart, Calendar, ChevronDown } from 'lucide-react'
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
        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Nama Workout</label>
            <Input
              id="name"
              placeholder="Contoh: Dumbbell Curl"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={error}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tipe Workout</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('lift')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  type === 'lift'
                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Dumbbell className="w-4 h-4" />
                Angkat Beban
              </button>
              <button
                type="button"
                onClick={() => setType('cardio')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  type === 'cardio'
                    ? 'bg-orange-50 border-orange-300 text-orange-700 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Heart className="w-4 h-4" />
                Cardio
              </button>
            </div>
          </div>

          {type === 'lift' && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Pengaturan Angkat Beban</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Default Sets</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="3"
                    value={defaultSets}
                    onChange={(e) => setDefaultSets(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Default Reps</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="10"
                    value={defaultReps}
                    onChange={(e) => setDefaultReps(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {type === 'cardio' && (
            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Pengaturan Cardio</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Jarak (meter)</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="200"
                    value={defaultDistance}
                    onChange={(e) => setDefaultDistance(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Durasi (menit)</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="10"
                    value={defaultDuration}
                    onChange={(e) => setDefaultDuration(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Deskripsi (opsional)</label>
            <Input
              id="desc"
              placeholder="Catatan tentang workout ini"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Jadwal Mingguan</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {DAY_NAMES.map((name, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`px-3.5 py-1.5 text-sm rounded-full border transition-all ${
                    scheduleDays.includes(i)
                      ? 'bg-green-600 text-white border-green-600 shadow-sm font-medium'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" loading={loading} className="min-w-[120px]">
              Simpan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
