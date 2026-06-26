'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogFooter } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useCreateExercise, useDeleteExercise } from '@/hooks/useExercises'
import type { Exercise } from '@/types'

interface Props {
  exercises: Exercise[]
}

export function WorkoutList({ exercises: initialExercises }: Props) {
  const [exercises, setExercises] = useState(initialExercises)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const router = useRouter()

  const createMutation = useCreateExercise()
  const deleteMutation = useDeleteExercise()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const result = await createMutation.mutateAsync({
      name: newName,
      description: newDesc || undefined,
    })
    setExercises((prev) => [...prev, result])
    setNewName('')
    setNewDesc('')
    setShowNew(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!deleteId) return
    await deleteMutation.mutateAsync(deleteId)
    setExercises((prev) => prev.filter((ex) => ex.id !== deleteId))
    setDeleteId(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowNew(true)}>
        <Plus className="w-4 h-4" />
        Tambah Exercise
      </Button>

      <Dialog open={showNew} onClose={() => setShowNew(false)} title="Tambah Exercise Baru">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            id="name"
            label="Nama Exercise"
            placeholder="Contoh: Dumbbell Curl"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <Input
            id="desc"
            label="Deskripsi (opsional)"
            placeholder="Catatan tentang exercise ini"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowNew(false)}>
              Batal
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {exercises.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <p>Belum ada exercise. Tambahkan exercise pertamamu!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium truncate">{exercise.name}</h3>
                    {exercise.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{exercise.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2 shrink-0">
                    <Link href={`/workouts/${exercise.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(exercise.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Hapus Exercise"
        description="Apakah kamu yakin ingin menghapus exercise ini? Semua log terkait juga akan dihapus."
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
