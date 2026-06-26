'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogFooter } from '@/components/ui/dialog'
import { Trash2, CheckCircle2, Circle } from 'lucide-react'
import { useDeleteLog, useToggleLogDone } from '@/hooks/useLogs'
import type { WorkoutLog } from '@/types'

function formatLogDetail(log: WorkoutLog): string {
  if (log.workout?.type === 'cardio') {
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

interface Props {
  logs: WorkoutLog[]
}

export function LogList({ logs }: Props) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const deleteMutation = useDeleteLog()
  const toggleMutation = useToggleLogDone()

  async function handleDelete() {
    if (!deleteId) return
    await deleteMutation.mutateAsync(deleteId)
    setDeleteId(null)
  }

  async function handleToggle(log: WorkoutLog) {
    await toggleMutation.mutateAsync({ id: log.id, is_done: !log.is_done })
  }

  if (logs.length === 0) {
    return <p className="text-sm text-gray-500 py-4 text-center">Belum ada log</p>
  }

  return (
    <>
      <div className="divide-y divide-gray-100">
        {logs.map((log) => (
          <div key={log.id} className={`py-3 flex items-center justify-between ${log.is_done ? 'opacity-70' : ''}`}>
            <button onClick={() => handleToggle(log)} className="flex items-center gap-3 flex-1 text-left">
              {log.is_done ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300 shrink-0" />
              )}
              <div className={log.is_done ? 'line-through text-gray-400' : ''}>
                <p className="font-medium">{log.workout?.name}</p>
                <p className="text-sm text-gray-500">{formatLogDetail(log)}</p>
                {log.notes && (
                  <p className="text-xs text-gray-400 mt-0.5">{log.notes}</p>
                )}
              </div>
            </button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteId(log.id)}>
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
