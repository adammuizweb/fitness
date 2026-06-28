'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export interface SharedWorkout {
  id: string
  user_id: string
  source_workout_id: string | null
  name: string
  type: 'lift' | 'cardio'
  default_sets: number | null
  default_reps: number | null
  default_distance: number | null
  default_duration: number | null
  description: string | null
  created_at: string
}

async function fetchUserSharedWorkouts(userId: string): Promise<SharedWorkout[]> {
  const { data, error } = await supabase
    .from('shared_workouts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

async function fetchMySharedWorkouts(): Promise<SharedWorkout[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  return fetchUserSharedWorkouts(user.id)
}

async function shareWorkout(input: {
  source_workout_id?: string
  name: string
  type: 'lift' | 'cardio'
  default_sets?: number | null
  default_reps?: number | null
  default_distance?: number | null
  default_duration?: number | null
  description?: string | null
}): Promise<SharedWorkout> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('shared_workouts')
    .insert({
      user_id: user.id,
      source_workout_id: input.source_workout_id || null,
      name: input.name,
      type: input.type,
      default_sets: input.default_sets ?? null,
      default_reps: input.default_reps ?? null,
      default_distance: input.default_distance ?? null,
      default_duration: input.default_duration ?? null,
      description: input.description || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

async function unshareWorkout(id: string): Promise<void> {
  const { error } = await supabase.from('shared_workouts').delete().eq('id', id)
  if (error) throw error
}

async function copyWorkoutToMine(sharedWorkout: SharedWorkout): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('workouts').insert({
    user_id: user.id,
    name: sharedWorkout.name,
    type: sharedWorkout.type,
    description: sharedWorkout.description || `Copied from community workout`,
    default_sets: sharedWorkout.default_sets,
    default_reps: sharedWorkout.default_reps,
    default_distance: sharedWorkout.default_distance,
    default_duration: sharedWorkout.default_duration,
    is_active: true,
    copied_from_share_id: sharedWorkout.id,
  })

  if (error) throw error
}

export function useUserSharedWorkouts(userId: string) {
  return useQuery({
    queryKey: ['sharedWorkouts', userId],
    queryFn: () => fetchUserSharedWorkouts(userId),
    enabled: !!userId,
  })
}

export function useMySharedWorkouts() {
  return useQuery({
    queryKey: ['sharedWorkouts', 'mine'],
    queryFn: fetchMySharedWorkouts,
  })
}

export function useShareWorkout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: shareWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedWorkouts'] })
    },
  })
}

export function useUnshareWorkout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: unshareWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedWorkouts'] })
    },
  })
}

export function useCopyWorkout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: copyWorkoutToMine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
    },
  })
}
