'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ExerciseInput } from '@/types'

interface Props {
  defaultValues?: ExerciseInput
  onSubmit: (data: ExerciseInput) => Promise<void>
  loading: boolean
}

export function WorkoutForm({ defaultValues, onSubmit, loading }: Props) {
  const [name, setName] = useState(defaultValues?.name || '')
  const [description, setDescription] = useState(defaultValues?.description || '')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Nama exercise wajib diisi')
      return
    }

    await onSubmit({ name: name.trim(), description: description.trim() || undefined })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <Input
            id="name"
            label="Nama Exercise"
            placeholder="Contoh: Dumbbell Curl"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error}
            required
          />
          <Input
            id="desc"
            label="Deskripsi (opsional)"
            placeholder="Deskripsi atau catatan"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
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
