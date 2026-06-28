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

export function useMyPosts() {
  return useQuery({
    queryKey: ['posts', 'mine'],
    queryFn: fetchMyPosts,
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
