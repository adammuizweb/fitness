'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import { useUpdatePost } from '@/hooks/usePosts'
import { Globe, Users, UserCheck, Lock, Save } from 'lucide-react'
import type { Post, PostPrivacy } from '@/types'

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
  post: Post
  open: boolean
  onClose: () => void
}

export function EditPostDialog({ post, open, onClose }: Props) {
  const { t } = useI18n()
  const updateMutation = useUpdatePost()
  const [caption, setCaption] = useState(post.caption || '')
  const [privacy, setPrivacy] = useState<PostPrivacy>(post.privacy)

  async function handleSubmit() {
    await updateMutation.mutateAsync({
      id: post.id,
      caption: caption || null,
      privacy,
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title="Edit Post">
      <div className="space-y-4">
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption..."
          rows={3}
          className="w-full rounded-lg border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {post.photos.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.photos.map((url) => (
              <img key={url} src={url} alt="" className="w-14 h-14 object-cover rounded-lg" />
            ))}
          </div>
        )}

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
          <Button onClick={handleSubmit} loading={updateMutation.isPending}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
