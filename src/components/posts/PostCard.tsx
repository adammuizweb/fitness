'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n/context'
import { useDeletePost } from '@/hooks/usePosts'
import { EditPostDialog } from './EditPostDialog'
import { Globe, Users, UserCheck, Lock, Trash2, Clock, Pencil } from 'lucide-react'
import type { Post, Profile } from '@/types'

const privacyKey: Record<string, string> = {
  all: 'All',
  followers: 'Followers',
  friends: 'Friends',
  only_me: 'OnlyMe',
}

const privacyIcons: Record<string, React.ReactNode> = {
  all: <Globe className="w-3 h-3" />,
  followers: <Users className="w-3 h-3" />,
  friends: <UserCheck className="w-3 h-3" />,
  only_me: <Lock className="w-3 h-3" />,
}

const privacyColors: Record<string, string> = {
  all: 'text-green-600 bg-green-50',
  followers: 'text-blue-600 bg-blue-50',
  friends: 'text-purple-600 bg-purple-50',
  only_me: 'text-gray-600 bg-gray-100',
}

interface Props {
  post: Post
  showActions?: boolean
  showPrivacy?: boolean
  author?: Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url'> | null
}

export function PostCard({ post, showActions = true, showPrivacy = true, author }: Props) {
  const { t } = useI18n()
  const deleteMutation = useDeletePost()
  const [editing, setEditing] = useState(false)

  const date = new Date(post.created_at).toLocaleDateString('id-ID', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const isOwn = !author

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              {author ? (
                <Link href={`/dashboard/community/user/${author.username}`} className="shrink-0">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                    {author.avatar_url ? (
                      <img src={author.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-green-700">
                        {author.username?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </Link>
              ) : (
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-green-700">You</span>
                </div>
              )}
              <div className="min-w-0">
                {author ? (
                  <Link href={`/dashboard/community/user/${author.username}`} className="hover:underline">
                    <p className="text-sm font-medium truncate">{author.full_name || author.username}</p>
                  </Link>
                ) : (
                  <p className="text-sm font-medium">You</p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span className="truncate">{date}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {showPrivacy && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${privacyColors[post.privacy] || 'text-gray-600 bg-gray-100'}`}>
                  {privacyIcons[post.privacy] || null}
                  {t(`settings.privacy${privacyKey[post.privacy] || 'All'}`)}
                </span>
              )}
              {showActions && isOwn && (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-gray-300 hover:text-blue-500 transition-colors p-1"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this post?')) deleteMutation.mutate(post.id) }}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {post.caption && (
            <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{post.caption}</p>
          )}

          {(post.photos?.length ?? 0) > 0 && (
            <div className={`grid gap-1 ${post.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {post.photos.map((url) => (
                <img key={url} src={url} alt="" className="w-full aspect-square object-cover rounded-lg" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editing && (
        <EditPostDialog
          post={post}
          open={editing}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  )
}
