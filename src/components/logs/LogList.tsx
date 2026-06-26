'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogFooter } from '@/components/ui/dialog'
import { Trash2 } from 'lucide-react'
import { useDeleteLog } from '@/hooks/useLogs'
import type { WorkoutLog } from '@/types'

interface Props {
  logs: WorkoutLog[]
}

export function LogList({ logs }: Props) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const router = useRouter()
  const deleteMutation = useDeleteLog()

  async function handleDelete() {
    if (!deleteId) return
    await deleteMutation.mutateAsync(deleteId)
    setDeleteId(null)
    router.refresh()
  }

  if (logs.length === 0) {
    return <p className="text-sm text-gray-500 py-4 text-center">Belum ada log</p>
  }

  return (
    <>
      <div className="divide-y divide-gray-100">
        {logs.map((log) => (
          <div key={log.id} className="py-3 flex items-center justify-between">
            <div>
              <p className="font-medium">{log.exercise?.name}</p>
              <p className="text-sm text-gray-500">
                {log.sets} set × {log.reps} rep
                {log.weight ? ` • ${log.weight} kg` : ''}
              </p>
              {log.notes && (
                <p className="text-xs text-gray-400 mt-0.5">{log.notes}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteId(log.id)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Hapus Log"
        description="Apakah kamu yakin ingin menghapus log ini?"
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
    </>
  )
}
