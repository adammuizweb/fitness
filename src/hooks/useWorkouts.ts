'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Workout, WorkoutInput } from '@/types'

const supabase = createClient()

async function fetchWorkouts(): Promise<Workout[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

async function createWorkout(input: WorkoutInput): Promise<Workout> {
  const { data, error } = await supabase
    .from('workouts')
    .insert({
      name: input.name,
      description: input.description || null,
      type: input.type,
      default_sets: input.default_sets || null,
      default_reps: input.default_reps || null,
      default_distance: input.default_distance || null,
      default_duration: input.default_duration || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

const supabaseAdmin = createClient()

async function createWorkoutWithSchedule(input: WorkoutInput & { schedule_days: number[] }): Promise<Workout> {
  const workout = await createWorkout(input)

  if (input.schedule_days.length > 0) {
    const { error } = await supabaseAdmin
      .from('workout_schedules')
      .insert(
        input.schedule_days.map((day) => ({
          workout_id: workout.id,
          day_of_week: day,
        }))
      )

    if (error) throw error
  }

  return workout
}

async function updateWorkout(id: string, input: WorkoutInput): Promise<Workout> {
  const { data, error } = await supabase
    .from('workouts')
    .update({
      name: input.name,
      description: input.description || null,
      type: input.type,
      default_sets: input.default_sets || null,
      default_reps: input.default_reps || null,
      default_distance: input.default_distance || null,
      default_duration: input.default_duration || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

async function deleteWorkout(id: string): Promise<void> {
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export function useWorkouts() {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: fetchWorkouts,
  })
}

export function useCreateWorkout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
    },
  })
}

export function useCreateWorkoutWithSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createWorkoutWithSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
    },
  })
}

export function useUpdateWorkout(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: WorkoutInput) => updateWorkout(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
    },
  })
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
    },
  })
}
