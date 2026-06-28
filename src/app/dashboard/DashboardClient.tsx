'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import { Dumbbell, ClipboardList, Flame, TrendingUp, Share2, Camera } from 'lucide-react'
import { useTodayLogs } from '@/hooks/useLogs'
import { useStreak } from '@/hooks/useStreak'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useMyPosts, useMyPostsFull } from '@/hooks/usePosts'
import { PostCard } from '@/components/posts/PostCard'
import { CreatePostDialog } from '@/components/posts/CreatePostDialog'
import { Skeleton, SkeletonStatCard } from '@/components/ui/Skeleton'

export function DashboardClient() {
  const { t } = useI18n()
  const [showCreatePost, setShowCreatePost] = useState(false)
  const { data: logs = [], isLoading: logsLoading } = useTodayLogs()
  const { data: streak, isLoading: streakLoading } = useStreak()
  const { data: workouts, isLoading: workoutsLoading } = useWorkouts()
  const { data: posts = [], isLoading: postsLoading } = useMyPosts(3)

  if (logsLoading || streakLoading || workoutsLoading) {
    return <DashboardSkeleton />
  }

  const totalWorkouts = workouts?.length || 0
  const totalSets = logs.reduce((sum, log) => sum + (log.sets || 0), 0)
  const totalReps = logs.reduce((sum, log) => sum + (log.reps || 0), 0)
  const currentStreak = streak?.current_streak || 0
  const hasPhotos = logs.some(l => (l.photos?.length ?? 0) > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {logs.length === 0
              ? t('dashboard.noWorkout')
              : t('dashboard.loggedCount', { count: logs.length })}
          </p>
        </div>

        <Link href="/dashboard/log">
          <Button>
            <ClipboardList className="w-4 h-4 mr-2" />
            {t('dashboard.logWorkout')}
          </Button>
        </Link>
      </div>

      {/* Share prompt — only when there's something to share */}
      {logs.length > 0 && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-800">Share your workout!</p>
                <p className="text-sm text-green-600">
                  {hasPhotos
                    ? 'You have photos — inspire others with your progress!'
                    : 'Inspire others by sharing what you did today.'}
                </p>
              </div>
            </div>
            <Button onClick={() => setShowCreatePost(true)} className="shrink-0">
              <Camera className="w-4 h-4 mr-1" />
              Share
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('dashboard.streak')}</p>
              <p className="text-2xl font-bold">{currentStreak}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('dashboard.workouts')}</p>
              <p className="text-2xl font-bold">{totalWorkouts}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('dashboard.setsToday')}</p>
              <p className="text-2xl font-bold">{totalSets}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.workoutToday')}</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">
                {t('dashboard.noWorkout')}
              </p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{log.workout?.name}</p>
                      <p className="text-sm text-gray-500">
                        {log.sets && log.sets > 0
                          ? `${log.sets} set x ${log.reps} rep${log.weight ? ` \u2022 ${log.weight} kg` : ''}`
                          : `${log.distance} m \u2022 ${log.duration} menit`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.repsToday')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{totalReps}</p>
            <p className="text-sm text-gray-500 mt-1">
              {currentStreak > 0 && t('dashboard.streakFire', { count: currentStreak })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* My Posts */}
      {posts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Your Posts</h2>
            <Link href="/dashboard/posts" className="text-sm text-green-600 hover:text-green-700 font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} showActions={false} />
            ))}
          </div>
        </div>
      )}

      {/* Create Post Dialog */}
      {showCreatePost && (
        <CreatePostDialog
          open={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          logs={logs}
        />
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 mb-2 bg-gray-50 rounded-lg">
              <div>
                <Skeleton className="h-4 w-36 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-10 w-16 mb-2" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    </div>
  )
}
