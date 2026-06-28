'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { PostCard } from '@/components/posts/PostCard'
import { usePublicPosts, useSearchUsers } from '@/hooks/useCommunity'
import { useI18n } from '@/lib/i18n/context'
import { Search, Users, Loader2, Globe, ChevronDown } from 'lucide-react'

export default function CommunityPage() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePublicPosts()
  const { data: searchResults } = useSearchUsers(searchQuery)

  const posts = data?.pages.flatMap(p => p) || []

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Community' },
      ]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Community</h1>
          <p className="text-gray-500 text-sm mt-1">See what others are sharing</p>
        </div>
        <Button variant="outline" onClick={() => setShowSearch(!showSearch)}>
          <Users className="w-4 h-4 mr-1" />
          Find People
        </Button>
      </div>

      {/* User search */}
      {showSearch && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
            </div>
            {searchQuery.length > 0 && searchResults && (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-gray-500 py-2 text-center">No users found</p>
                ) : (
                  searchResults.map((user) => (
                    <Link
                      key={user.id}
                      href={`/dashboard/community/user/${user.username}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center overflow-hidden shrink-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-medium text-green-700">
                            {user.username?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{user.full_name || user.username}</p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Feed */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No public posts yet.</p>
            <p className="text-sm text-gray-400 mt-1">Be the first to share your workout!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              showActions={false}
              showPrivacy={false}
              author={post.profile}
            />
          ))}

          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                loading={isFetchingNextPage}
              >
                <ChevronDown className="w-4 h-4 mr-1" />
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
