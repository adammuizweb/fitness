'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useShareWorkout } from '@/hooks/useSharedWorkouts'
import { Globe, Check } from 'lucide-react'
import type { Workout } from '@/types'

interface Props {
  workout: Workout
  open: boolean
  onClose: () => void
}

export function ShareWorkoutDialog({ workout, open, onClose }: Props) {
  const shareMutation = useShareWorkout()
  const [description, setDescription] = useState(workout.description || '')

  async function handleShare() {
    await shareMutation.mutateAsync({
      source_workout_id: workout.id,
      name: workout.name,
      type: workout.type,
      default_sets: workout.default_sets,
      default_reps: workout.default_reps,
      default_distance: workout.default_distance,
      default_duration: workout.default_duration,
      description: description || null,
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title="Share Workout">
      <div className="space-y-4">
        <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3">
          <Globe className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">Public on your profile</p>
            <p className="text-xs text-green-600">Anyone can see and copy this workout</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm font-medium">{workout.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {workout.type === 'lift'
              ? `${workout.default_sets || '?'} × ${workout.default_reps || '?'}`
              : `${workout.default_distance || '?'}m · ${workout.default_duration || '?'}min`}
          </p>
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add notes or tips for others..."
          rows={3}
          className="w-full rounded-lg border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleShare} loading={shareMutation.isPending}>
            <Globe className="w-4 h-4 mr-1" />
            Share to Community
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
