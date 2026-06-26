'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { WorkoutLog, WorkoutLogInput } from '@/types'

const supabase = createClient()

async function fetchTodayLogs(): Promise<WorkoutLog[]> {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*, exercise:exercises(*)')
    .eq('logged_date', today)
    .order('created_at')

  if (error) throw error
  return data
}

async function fetchLogsByDate(date: string): Promise<WorkoutLog[]> {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*, exercise:exercises(*)')
    .eq('logged_date', date)
    .order('created_at')

  if (error) throw error
  return data
}

async function fetchLogHistory(): Promise<WorkoutLog[]> {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*, exercise:exercises(*)')
    .order('logged_date', { ascending: false })
    .limit(50)

  if (error) throw error
  return data
}

async function upsertLog(input: WorkoutLogInput): Promise<WorkoutLog> {
  const today = input.logged_date || new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('workout_logs')
    .select('id')
    .eq('exercise_id', input.exercise_id)
    .eq('logged_date', today)
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('workout_logs')
      .update({
        sets: input.sets,
        reps: input.reps,
        weight: input.weight || null,
        notes: input.notes || null,
      })
      .eq('id', existing.id)
      .select('*, exercise:exercises(*)')
      .single()

    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('workout_logs')
    .insert({
      exercise_id: input.exercise_id,
      sets: input.sets,
      reps: input.reps,
      weight: input.weight || null,
      notes: input.notes || null,
      logged_date: today,
    })
    .select('*, exercise:exercises(*)')
    .single()

  if (error) throw error
  return data
}

async function deleteLog(id: string): Promise<void> {
  const { error } = await supabase
    .from('workout_logs')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export function useTodayLogs() {
  return useQuery({
    queryKey: ['logs', 'today'],
    queryFn: fetchTodayLogs,
  })
}

export function useLogsByDate(date: string) {
  return useQuery({
    queryKey: ['logs', date],
    queryFn: () => fetchLogsByDate(date),
    enabled: !!date,
  })
}

export function useLogHistory() {
  return useQuery({
    queryKey: ['logs', 'history'],
    queryFn: fetchLogHistory,
  })
}

export function useUpsertLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: upsertLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] })
      queryClient.invalidateQueries({ queryKey: ['streak'] })
    },
  })
}

export function useDeleteLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] })
      queryClient.invalidateQueries({ queryKey: ['streak'] })
    },
  })
}
