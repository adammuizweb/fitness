'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n/context'
import { useDeletePost } from '@/hooks/usePosts'
import { useUser } from '@/hooks/useUser'
import { EditPostDialog } from './EditPostDialog'
import { Globe, Users, UserCheck, Lock, Trash2, Clock, Pencil, Loader2, Sparkles } from 'lucide-react'
import { PhotoWithFallback } from '@/components/ui/PhotoWithFallback'
import { PhotoLightbox } from '@/components/ui/PhotoLightbox'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { getPostPhotos, getPostLogIds } from '@/lib/utils'
import type { Post, Profile, WorkoutLog } from '@/types'

const supabase = createClient()

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

async function fetchPostLogs(logIds: string[]): Promise<WorkoutLog[]> {
  if (logIds.length === 0) return []
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*, workout:workouts(*)')
    .in('id', logIds)
  if (error) throw error
  return data || []
}

export function PostCard({ post, showActions = true, showPrivacy = true, author }: Props) {
  const { t } = useI18n()
  const deleteMutation = useDeletePost()
  const { profile } = useUser()
  const [editing, setEditing] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const postPhotos = getPostPhotos(post.photos || [])
  const logIds = getPostLogIds(post.photos || [])

  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['post', post.id, 'logs'],
    queryFn: () => fetchPostLogs(logIds),
    enabled: logIds.length > 0,
  })

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
                      <img src={author.avatar_url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ) : (
                      <span className="text-xs font-bold text-green-700">
                        {author.username?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </Link>
              ) : (
                <Link href="/dashboard/profile" className="shrink-0">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ) : (
                      <span className="text-xs font-bold text-green-700">
                        {profile?.username?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </Link>
              )}
              <div className="min-w-0">
                {author ? (
                  <Link href={`/dashboard/community/user/${author.username}`} className="hover:underline">
                    <p className="text-sm font-medium truncate">{author.full_name || author.username}</p>
                  </Link>
                ) : (
                  <Link href="/dashboard/profile" className="hover:underline">
                    <p className="text-sm font-medium truncate">{profile?.full_name || profile?.username}</p>
                  </Link>
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

          {logsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : logs.length > 0 ? (
            <>
              {(() => {
                const workouts = logs.filter(l => l.workout?.is_active !== false)
                const customs = logs.filter(l => l.workout?.is_active === false)
                return (
                  <>
                    {workouts.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                        {workouts.map((log, i) => {
                          const colors = [
                            'bg-rose-50 border-rose-200',
                            'bg-sky-50 border-sky-200',
                            'bg-amber-50 border-amber-200',
                            'bg-emerald-50 border-emerald-200',
                            'bg-violet-50 border-violet-200',
                            'bg-cyan-50 border-cyan-200',
                          ]
                          const c = colors[i % colors.length]
                          return (
                            <div key={log.id} className={`rounded-xl border p-3 ${c}`}>
                              <p className="text-2xl font-black text-gray-300 leading-none mb-1">{i + 1}</p>
                              <p className="text-sm font-semibold text-gray-800 leading-tight">{log.workout?.name}</p>
                              <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                {log.sets ? <p>{log.sets} set × {log.reps} rep</p> : null}
                                {log.weight ? <p>{log.weight} kg</p> : null}
                                {log.distance ? <p>{log.distance} m</p> : null}
                                {log.duration ? <p>{log.duration} min</p> : null}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {customs.length > 0 && (
                      <div className="mb-3">
                        {customs.length === 1 ? (
                          <div className="flex items-center gap-1.5 text-sm text-gray-700">
                            <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span className="font-medium text-gray-800">{customs[0].workout?.name}</span>
                            {customs[0].notes && <span className="text-gray-400 italic">— {customs[0].notes}</span>}
                          </div>
                        ) : (
                          <>
                            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1.5">Custom Activity</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {customs.map((log, i) => {
                                const colors = ['bg-fuchsia-50 border-fuchsia-200', 'bg-indigo-50 border-indigo-200']
                                const c = colors[i % colors.length]
                                const letter = String.fromCharCode(97 + i)
                                return (
                                  <div key={log.id} className={`rounded-xl border p-3 ${c}`}>
                                    <p className="text-2xl font-black text-gray-300 leading-none mb-1">{letter}</p>
                                    <p className="text-sm font-semibold text-gray-800 leading-tight">{log.workout?.name}</p>
                                    {log.notes && <p className="text-xs text-gray-400 italic mt-1">— {log.notes}</p>}
                                  </div>
                                )
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )
              })()}
            </>
          ) : null}

          {postPhotos.length > 0 && (
            <div className={`grid gap-1 ${postPhotos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {postPhotos.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className="block w-full text-left rounded-lg overflow-hidden"
                >
                  <PhotoWithFallback
                    src={url}
                    alt=""
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {lightboxIndex !== null && postPhotos && (
        <PhotoLightbox
          photos={postPhotos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

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
