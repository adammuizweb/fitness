'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { WorkoutSchedule } from '@/types'

const supabase = createClient()

async function fetchSchedules(): Promise<WorkoutSchedule[]> {
  const { data, error } = await supabase
    .from('workout_schedules')
    .select('*, workout:workouts(*)')
    .order('day_of_week')

  if (error) throw error
  return data
}

async function fetchSchedulesByDay(day: number): Promise<WorkoutSchedule[]> {
  const { data, error } = await supabase
    .from('workout_schedules')
    .select('*, workout:workouts(*)')
    .eq('day_of_week', day)

  if (error) throw error
  return data
}

export function useSchedules() {
  return useQuery({
    queryKey: ['schedules'],
    queryFn: fetchSchedules,
  })
}

export function useSchedulesByDay(day: number) {
  return useQuery({
    queryKey: ['schedules', day],
    queryFn: () => fetchSchedulesByDay(day),
    enabled: day >= 0 && day <= 6,
  })
}
