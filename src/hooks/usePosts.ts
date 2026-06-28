'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Post, PostPrivacy } from '@/types'

const supabase = createClient()

async function fetchMyPosts(): Promise<Post[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return data || []
}

async function createPost(input: {
  workout_log_id?: string
  caption?: string
  photos?: string[]
  privacy: PostPrivacy
}): Promise<Post> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      workout_log_id: input.workout_log_id || null,
      caption: input.caption || null,
      photos: input.photos || [],
      privacy: input.privacy,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}

async function updatePost(id: string, input: {
  caption?: string | null
  photos?: string[]
  privacy?: PostPrivacy
}): Promise<Post> {
  const payload: Record<string, unknown> = {}
  if (input.caption !== undefined) payload.caption = input.caption
  if (input.photos !== undefined) payload.photos = input.photos
  if (input.privacy !== undefined) payload.privacy = input.privacy

  const { data, error } = await supabase
    .from('posts')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

async function fetchAllMyPosts(): Promise<Post[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

async function searchMyPosts(query: string): Promise<Post[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id)
    .ilike('caption', `%${query}%`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export function useMyPosts(limit = 20) {
  return useQuery({
    queryKey: ['posts', 'mine', limit],
    queryFn: () => fetchAllMyPosts().then(posts => limit ? posts.slice(0, limit) : posts),
  })
}

export function useMyPostsFull() {
  return useQuery({
    queryKey: ['posts', 'mine', 'full'],
    queryFn: fetchAllMyPosts,
  })
}

export function useSearchPosts(query: string) {
  return useQuery({
    queryKey: ['posts', 'search', query],
    queryFn: () => searchMyPosts(query),
    enabled: query.length > 0,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Parameters<typeof updatePost>[1]) =>
      updatePost(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
