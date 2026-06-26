'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { WorkoutLog, WorkoutLogInput } from '@/types'

const supabase = createClient()

async function fetchTodayLogs(): Promise<WorkoutLog[]> {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*, workout:workouts(*)')
    .eq('logged_date', today)
    .order('created_at')

  if (error) throw error
  return data
}

async function fetchLogsByDate(date: string): Promise<WorkoutLog[]> {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*, workout:workouts(*)')
    .eq('logged_date', date)
    .order('created_at')

  if (error) throw error
  return data
}

async function fetchLogHistory(): Promise<WorkoutLog[]> {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*, workout:workouts(*)')
    .order('logged_date', { ascending: false })
    .limit(50)

  if (error) throw error
  return data
}

async function upsertLog(input: WorkoutLogInput & { logged_date?: string }): Promise<WorkoutLog> {
  const today = input.logged_date || new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('workout_logs')
    .select('id')
    .eq('workout_id', input.workout_id)
    .eq('logged_date', today)
    .maybeSingle()

  const payload: Record<string, unknown> = {
    sets: input.sets ?? null,
    reps: input.reps ?? null,
    weight: input.weight ?? null,
    distance: input.distance ?? null,
    duration: input.duration ?? null,
    notes: input.notes || null,
    is_done: input.is_done ?? true,
  }

  if (existing) {
    const { data, error } = await supabase
      .from('workout_logs')
      .update(payload)
      .eq('id', existing.id)
      .select('*, workout:workouts(*)')
      .single()

    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('workout_logs')
    .insert({
      workout_id: input.workout_id,
      ...payload,
      logged_date: today,
    })
    .select('*, workout:workouts(*)')
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

async function toggleLogDone(id: string, is_done: boolean): Promise<void> {
  const { error } = await supabase
    .from('workout_logs')
    .update({ is_done })
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

export function useToggleLogDone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, is_done }: { id: string; is_done: boolean }) => toggleLogDone(id, is_done),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] })
      queryClient.invalidateQueries({ queryKey: ['streak'] })
    },
  })
}
