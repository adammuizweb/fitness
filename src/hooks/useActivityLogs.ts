'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

const SYSTEM_WORKOUT_NAME = '\u{1F3F7}\uFE0F Custom Activity'

export interface ActivityLog {
  id: string
  activity_name: string
  logged_date: string
}

async function getSystemWorkout(userId: string): Promise<string> {
  const { data: existing } = await supabase
    .from('workouts')
    .select('id')
    .eq('user_id', userId)
    .eq('name', SYSTEM_WORKOUT_NAME)
    .maybeSingle()

  if (existing) return existing.id

  const { data, error } = await supabase
    .from('workouts')
    .insert({
      user_id: userId,
      name: SYSTEM_WORKOUT_NAME,
      type: 'lift',
      default_sets: 1,
      default_reps: 1,
      is_active: false,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

async function fetchTodayActivities(): Promise<ActivityLog[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('workout_logs')
    .select('id, notes, logged_date, workout:workouts!inner(name)')
    .eq('user_id', user.id)
    .eq('logged_date', today)
    .eq('workout.name', SYSTEM_WORKOUT_NAME)
    .order('created_at')

  if (error) throw error
  return (data || []).map((l: Record<string, unknown>) => ({
    id: l.id as string,
    activity_name: (l.notes as string) || 'Custom Activity',
    logged_date: l.logged_date as string,
  }))
}

async function createActivity(activityName: string): Promise<ActivityLog> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const today = new Date().toISOString().split('T')[0]
  const workoutId = await getSystemWorkout(user.id)

  const { data, error } = await supabase
    .from('workout_logs')
    .insert({
      user_id: user.id,
      workout_id: workoutId,
      sets: 1,
      reps: 1,
      notes: activityName,
      logged_date: today,
      is_done: true,
    })
    .select('id, notes, logged_date')
    .single()

  if (error) throw error
  return {
    id: data.id,
    activity_name: data.notes || activityName,
    logged_date: data.logged_date,
  }
}

async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase
    .from('workout_logs')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export function useTodayActivities() {
  return useQuery({
    queryKey: ['activity_logs', 'today'],
    queryFn: fetchTodayActivities,
  })
}

export function useCreateActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity_logs'] })
      queryClient.invalidateQueries({ queryKey: ['streak'] })
    },
  })
}

export function useDeleteActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity_logs'] })
      queryClient.invalidateQueries({ queryKey: ['streak'] })
    },
  })
}
