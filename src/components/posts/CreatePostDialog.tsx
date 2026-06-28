'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import { useCreatePost } from '@/hooks/usePosts'
import { Globe, Users, UserCheck, Lock, Send } from 'lucide-react'
import type { WorkoutLog, PostPrivacy } from '@/types'

const privacyKey: Record<string, string> = {
  all: 'All',
  followers: 'Followers',
  friends: 'Friends',
  only_me: 'OnlyMe',
}

const privacyOptions: { value: PostPrivacy; icon: React.ReactNode }[] = [
  { value: 'all', icon: <Globe className="w-4 h-4" /> },
  { value: 'followers', icon: <Users className="w-4 h-4" /> },
  { value: 'friends', icon: <UserCheck className="w-4 h-4" /> },
  { value: 'only_me', icon: <Lock className="w-4 h-4" /> },
]

interface Props {
  open: boolean
  onClose: () => void
  logs: WorkoutLog[]
}

export function CreatePostDialog({ open, onClose, logs }: Props) {
  const { t } = useI18n()
  const createMutation = useCreatePost()
  const [caption, setCaption] = useState('')
  const [privacy, setPrivacy] = useState<PostPrivacy>('all')
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>(logs.map(l => l.id))

  const selectedLogs = logs.filter(l => selectedLogIds.includes(l.id))
  const allPhotos = selectedLogs.flatMap(l => l.photos || [])

  async function handleSubmit() {
    if (selectedLogs.length === 0) return

    await createMutation.mutateAsync({
      caption: caption || undefined,
      photos: allPhotos,
      privacy,
    })
    setCaption('')
    setPrivacy('all')
    setSelectedLogIds(logs.map(l => l.id))
    onClose()
  }

  function toggleLog(id: string) {
    setSelectedLogIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <Dialog open={open} onClose={onClose} title="Share Your Workout">
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Inspire others — share what you did today!</p>

        {/* Select workouts */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">Select workouts to include:</p>
          {logs.map((log) => (
            <label
              key={log.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                selectedLogIds.includes(log.id) ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedLogIds.includes(log.id)}
                onChange={() => toggleLog(log.id)}
                className="accent-green-600"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{log.workout?.name}</p>
                <p className="text-xs text-gray-500">
                  {log.sets ? `${log.sets} set \u00d7 ${log.reps} rep` : ''}
                  {log.weight ? ` \u2022 ${log.weight} kg` : ''}
                  {log.distance ? `${log.distance} m` : ''}
                  {log.duration ? ` \u2022 ${log.duration} min` : ''}
                </p>
              </div>
            </label>
          ))}
        </div>

        {/* Caption */}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption..."
          rows={3}
          className="w-full rounded-lg border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {/* Photos preview */}
        {allPhotos.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {allPhotos.map((url) => (
              <img key={url} src={url} alt="" className="w-14 h-14 object-cover rounded-lg" />
            ))}
          </div>
        )}

        {/* Privacy selector */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Who can see this?</p>
          <select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value as PostPrivacy)}
            className="w-full rounded-lg border border-gray-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            {privacyOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(`settings.privacy${privacyKey[opt.value] || 'All'}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            loading={createMutation.isPending}
            disabled={selectedLogs.length === 0}
          >
            <Send className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
