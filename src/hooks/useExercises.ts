'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Exercise, ExerciseInput } from '@/types'

const supabase = createClient()

async function fetchExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

async function createExercise(input: ExerciseInput): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercises')
    .insert({ name: input.name, description: input.description || null })
    .select()
    .single()

  if (error) throw error
  return data
}

async function updateExercise(id: string, input: ExerciseInput): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercises')
    .update({ name: input.name, description: input.description || null })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

async function deleteExercise(id: string): Promise<void> {
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export function useExercises() {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: fetchExercises,
  })
}

export function useCreateExercise() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
    },
  })
}

export function useUpdateExercise(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ExerciseInput) => updateExercise(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
    },
  })
}

export function useDeleteExercise() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
    },
  })
}
