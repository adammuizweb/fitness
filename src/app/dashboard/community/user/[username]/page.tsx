'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { PostCard } from '@/components/posts/PostCard'
import {
  useUserByUsername,
  useUserPosts,
  useFollowStatus,
  useFollowCount,
  useFollowUser,
  useUnfollowUser,
} from '@/hooks/useCommunity'
import { useUser } from '@/hooks/useUser'
import { useUserSharedWorkouts, useCopyWorkout } from '@/hooks/useSharedWorkouts'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useI18n } from '@/lib/i18n/context'
import { Loader2, Globe, Lock, Users, UserCheck, UserPlus, Dumbbell, Copy } from 'lucide-react'
import Link from 'next/link'

export default function UserProfilePage() {
  const { t } = useI18n()
  const params = useParams()
  const username = params.username as string

  const { profile: currentUser } = useUser()
  const { data: profile, isLoading: profileLoading } = useUserByUsername(username)
  const { data: posts = [], isLoading: postsLoading } = useUserPosts(profile?.id || '')
  const { data: isFollowing, isLoading: followStatusLoading } = useFollowStatus(profile?.id || '')
  const { data: followCount } = useFollowCount(profile?.id || '')
  const { data: sharedWorkouts = [] } = useUserSharedWorkouts(profile?.id || '')
  const { data: myWorkouts } = useWorkouts()
  const copyMutation = useCopyWorkout()
  const followMutation = useFollowUser()
  const unfollowMutation = useUnfollowUser()

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[
          { label: 'Community', href: '/dashboard/community' },
          { label: username },
        ]} />
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">User not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isPrivate = !profile.is_public

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Community', href: '/dashboard/community' },
        { label: `@${profile.username}` },
      ]} />

      {/* Profile header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center overflow-hidden shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-green-700">
                  {profile.username?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold truncate">{profile.full_name || profile.username}</h1>
                {isPrivate ? (
                  <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                ) : (
                  <Globe className="w-4 h-4 text-green-500 shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-500">@{profile.username}</p>

              {/* Follow count */}
              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                <span><strong className="text-gray-700">{followCount?.followers || 0}</strong> followers</span>
                <span><strong className="text-gray-700">{followCount?.following || 0}</strong> following</span>
              </div>
            </div>

            {/* Follow button (hide for own profile) */}
            {!isPrivate && currentUser?.id !== profile.id && (
              <Button
                variant={isFollowing ? 'outline' : 'default'}
                size="sm"
                onClick={() => {
                  if (isFollowing) {
                    unfollowMutation.mutate(profile.id)
                  } else {
                    followMutation.mutate(profile.id)
                  }
                }}
                loading={followMutation.isPending || unfollowMutation.isPending}
                className="shrink-0"
              >
                {isFollowing ? (
                  <><UserCheck className="w-4 h-4 mr-1" /> Following</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-1" /> Follow</>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shared Workouts */}
      {!isPrivate && sharedWorkouts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Dumbbell className="w-5 h-5" />
              Workout Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sharedWorkouts.map((sw) => {
                const alreadyCopied = myWorkouts?.some(w => w.name === sw.name)
                return (
                  <div key={sw.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{sw.name}</p>
                      <p className="text-xs text-gray-500">
                        {sw.type === 'lift'
                          ? `${sw.default_sets || '?'} × ${sw.default_reps || '?'}`
                          : `${sw.default_distance || '?'}m · ${sw.default_duration || '?'}min`}
                        {sw.description && ` — ${sw.description}`}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={alreadyCopied ? 'outline' : 'default'}
                      onClick={() => copyMutation.mutate(sw)}
                      loading={copyMutation.isPending}
                      disabled={alreadyCopied}
                      className="shrink-0 ml-2"
                    >
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      {alreadyCopied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Private notice */}
      {isPrivate ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">This account is private</p>
            <p className="text-sm text-gray-400 mt-1">Follow to see their activity — if they accept.</p>
          </CardContent>
        </Card>
      ) : postsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-green-600" />
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No public posts yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Posts</h2>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              showActions={false}
              showPrivacy={false}
              author={post.profile}
            />
          ))}
        </div>
      )}
    </div>
  )
}
