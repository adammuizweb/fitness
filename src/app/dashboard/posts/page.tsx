'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { PostCard } from '@/components/posts/PostCard'
import { useMyPostsFull } from '@/hooks/usePosts'
import { useI18n } from '@/lib/i18n/context'
import { Search, Globe, Users, UserCheck, Lock, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import type { PostPrivacy } from '@/types'

const PER_PAGE = 10

const filters: { label: string; value: PostPrivacy | 'all'; icon: React.ReactNode }[] = [
  { label: 'All', value: 'all', icon: null },
  { label: 'All', value: 'all', icon: <Globe className="w-3.5 h-3.5" /> },
  { label: 'Followers', value: 'followers', icon: <Users className="w-3.5 h-3.5" /> },
  { label: 'Friends', value: 'friends', icon: <UserCheck className="w-3.5 h-3.5" /> },
  { label: 'Only Me', value: 'only_me', icon: <Lock className="w-3.5 h-3.5" /> },
]

export default function PostsPage() {
  const { t } = useI18n()
  const { data: allPosts = [], isLoading } = useMyPostsFull()
  const [search, setSearch] = useState('')
  const [privacyFilter, setPrivacyFilter] = useState<PostPrivacy | 'all'>('all')
  const [sortNewest, setSortNewest] = useState(true)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let result = [...allPosts]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p => p.caption?.toLowerCase().includes(q))
    }

    if (privacyFilter !== 'all') {
      result = result.filter(p => p.privacy === privacyFilter)
    }

    result.sort((a, b) =>
      sortNewest
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    return result
  }, [allPosts, search, privacyFilter, sortNewest])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Posts' },
      ]} />
      <div>
        <h1 className="text-2xl font-bold">Posts</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your shared workout posts</p>
      </div>

      {/* Search + Sort */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search caption..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button
          onClick={() => { setSortNewest(!sortNewest); setPage(1) }}
          className="text-xs text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg border border-gray-200"
        >
          {sortNewest ? 'Newest' : 'Oldest'}
        </button>
      </div>

      {/* Privacy filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'All', value: 'all' as const, icon: null },
          { label: 'All', value: 'all' as const, icon: <Globe className="w-3.5 h-3.5" /> },
          { label: 'Followers', value: 'followers' as const, icon: <Users className="w-3.5 h-3.5" /> },
          { label: 'Friends', value: 'friends' as const, icon: <UserCheck className="w-3.5 h-3.5" /> },
          { label: 'Only Me', value: 'only_me' as const, icon: <Lock className="w-3.5 h-3.5" /> },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => { setPrivacyFilter(f.value); setPage(1) }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              privacyFilter === f.value
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-transparent'
            }`}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      {/* Total count */}
      <p className="text-sm text-gray-500">{filtered.length} posts found</p>

      {/* Posts grid */}
      {paginated.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <p>No posts yet. Share your workout from the dashboard!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {paginated.map((post) => (
            <PostCard key={post.id} post={post} showActions />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(safePage - 1)}
            disabled={safePage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === safePage ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPage(p)}
              className="min-w-[36px]"
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(safePage + 1)}
            disabled={safePage >= totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
