'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export interface SharedPlan {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
}

export interface SharedPlanDay {
  id: string
  plan_id: string
  day_of_week: number
  workout_name: string
  workout_type: 'lift' | 'cardio'
  default_sets: number | null
  default_reps: number | null
  default_distance: number | null
  default_duration: number | null
  is_rest: boolean
}

export interface PlanWithDays extends SharedPlan {
  days: SharedPlanDay[]
}

async function fetchUserPlans(userId: string): Promise<PlanWithDays[]> {
  const { data: plans, error: planErr } = await supabase
    .from('shared_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (planErr) throw planErr

  const planIds = (plans || []).map(p => p.id)
  if (planIds.length === 0) return []

  const { data: days, error: dayErr } = await supabase
    .from('shared_plan_days')
    .select('*')
    .in('plan_id', planIds)
    .order('day_of_week')

  if (dayErr) throw dayErr

  return (plans || []).map(plan => ({
    ...plan,
    days: (days || []).filter(d => d.plan_id === plan.id),
  }))
}

async function createPlan(input: {
  name: string
  description?: string
  days: {
    day_of_week: number
    workout_name: string
    workout_type: 'lift' | 'cardio'
    default_sets?: number | null
    default_reps?: number | null
    default_distance?: number | null
    default_duration?: number | null
    is_rest?: boolean
  }[]
}): Promise<PlanWithDays> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: plan, error: planErr } = await supabase
    .from('shared_plans')
    .insert({
      user_id: user.id,
      name: input.name,
      description: input.description || null,
    })
    .select()
    .single()

  if (planErr) throw planErr

  const dayRows = input.days.map(d => ({
    plan_id: plan.id,
    day_of_week: d.day_of_week,
    workout_name: d.workout_name,
    workout_type: d.workout_type,
    default_sets: d.default_sets ?? null,
    default_reps: d.default_reps ?? null,
    default_distance: d.default_distance ?? null,
    default_duration: d.default_duration ?? null,
    is_rest: d.is_rest ?? false,
  }))

  const { data: days, error: dayErr } = await supabase
    .from('shared_plan_days')
    .insert(dayRows)
    .select()

  if (dayErr) throw dayErr

  return { ...plan, days: days || [] }
}

async function copyPlan(plan: PlanWithDays): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Create workouts for each non-rest day
  const workoutMap = new Map<string, string>() // workout_name -> new workout_id

  for (const day of plan.days) {
    if (day.is_rest) continue

    const { data: existing } = await supabase
      .from('workouts')
      .select('id, name')
      .eq('user_id', user.id)
      .eq('name', day.workout_name)
      .maybeSingle()

    let workoutId: string

    if (existing) {
      workoutId = existing.id
    } else {
      const { data: newW, error } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          name: day.workout_name,
          type: day.workout_type,
          default_sets: day.default_sets,
          default_reps: day.default_reps,
          default_distance: day.default_distance,
          default_duration: day.default_duration,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error
      workoutId = newW.id
    }

    workoutMap.set(day.workout_name, workoutId)
  }

  // Remove existing schedule for these days, then insert new
  const dayNumbers = plan.days.filter(d => !d.is_rest).map(d => d.day_of_week)

  if (dayNumbers.length > 0) {
    await supabase
      .from('workout_schedules')
      .delete()
      .eq('user_id', user.id)
      .in('day_of_week', dayNumbers)

    const scheduleRows = plan.days
      .filter(d => !d.is_rest && workoutMap.has(d.workout_name))
      .map(d => ({
        user_id: user.id,
        workout_id: workoutMap.get(d.workout_name)!,
        day_of_week: d.day_of_week,
      }))


    if (scheduleRows.length > 0) {
      const { error } = await supabase.from('workout_schedules').insert(scheduleRows)
      if (error) throw error
    }
  }
}

export function useUserPlans(userId: string) {
  return useQuery({
    queryKey: ['sharedPlans', userId],
    queryFn: () => fetchUserPlans(userId),
    enabled: !!userId,
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedPlans'] })
    },
  })
}

export function useCopyPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: copyPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
    },
  })
}
