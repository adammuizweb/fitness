'use client'

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Post, Profile } from '@/types'

const supabase = createClient()

const PAGE_SIZE = 10

export interface PostWithProfile extends Post {
  profile: Profile
}

async function fetchPublicPosts({ pageParam = 0 }): Promise<PostWithProfile[]> {
  const from = pageParam * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, error } = await supabase
    .from('posts')
    .select('*, profile:profiles!user_id(id, username, full_name, avatar_url)')
    .eq('privacy', 'all')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  return (data || []) as unknown as PostWithProfile[]
}

async function searchUsers(query: string): Promise<Profile[]> {
  const { data: { user: authUser } } = await supabase.auth.getUser()

  // Always include yourself, plus any public profiles matching the query
  let dbQuery = supabase
    .from('profiles')
    .select('*')

  if (authUser) {
    dbQuery = dbQuery.or(`is_public.eq.true,id.eq.${authUser.id}`)
  } else {
    dbQuery = dbQuery.eq('is_public', true)
  }

  const { data, error } = await dbQuery
    .ilike('username', `%${query}%`)
    .limit(20)

  if (error) throw error
  return data || []
}

async function getUserByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error) return null
  return data
}

async function getUserPosts(userId: string): Promise<PostWithProfile[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profile:profiles!user_id(id, username, full_name, avatar_url)')
    .eq('user_id', userId)
    .eq('privacy', 'all')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return (data || []) as unknown as PostWithProfile[]
}

async function getFollowStatus(followeeId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('followee_id', followeeId)
    .maybeSingle()

  return !!data
}

async function getFollowCount(userId: string): Promise<{ followers: number; following: number }> {
  const { count: followers } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('followee_id', userId)

  const { count: following } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId)

  return { followers: followers || 0, following: following || 0 }
}

async function followUser(followeeId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: user.id, followee_id: followeeId })

  if (error) throw error
}

async function unfollowUser(followeeId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('followee_id', followeeId)

  if (error) throw error
}

export function usePublicPosts() {
  return useInfiniteQuery({
    queryKey: ['community', 'posts'],
    queryFn: fetchPublicPosts,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < PAGE_SIZE ? undefined : allPages.length
    },
  })
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['community', 'users', 'search', query],
    queryFn: () => searchUsers(query),
    enabled: query.length > 0,
  })
}

export function useUserByUsername(username: string) {
  return useQuery({
    queryKey: ['community', 'user', username],
    queryFn: () => getUserByUsername(username),
    enabled: !!username,
  })
}

export function useUserPosts(userId: string) {
  return useQuery({
    queryKey: ['community', 'user', userId, 'posts'],
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
  })
}

export function useFollowStatus(followeeId: string) {
  return useQuery({
    queryKey: ['community', 'follow', followeeId],
    queryFn: () => getFollowStatus(followeeId),
    enabled: !!followeeId,
  })
}

export function useFollowCount(userId: string) {
  return useQuery({
    queryKey: ['community', 'followCount', userId],
    queryFn: () => getFollowCount(userId),
    enabled: !!userId,
  })
}

export function useFollowUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: followUser,
    onSuccess: (_, followeeId) => {
      queryClient.invalidateQueries({ queryKey: ['community', 'follow', followeeId] })
      queryClient.invalidateQueries({ queryKey: ['community', 'followCount'] })
    },
  })
}

export function useUnfollowUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: unfollowUser,
    onSuccess: (_, followeeId) => {
      queryClient.invalidateQueries({ queryKey: ['community', 'follow', followeeId] })
      queryClient.invalidateQueries({ queryKey: ['community', 'followCount'] })
    },
  })
}
