import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { WorkoutList } from '@/components/workouts/WorkoutList'

export default async function WorkoutsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const supabase = await createClient()

  const [{ data: workouts }, { data: schedules }] = await Promise.all([
    supabase.from('workouts').select('*').eq('user_id', user.id).order('name'),
    supabase.from('workout_schedules').select('*').eq('user_id', user.id),
  ])

  const scheduleDays = new Map<string, number[]>()
  for (const s of schedules || []) {
    const days = scheduleDays.get(s.workout_id) || []
    days.push(s.day_of_week)
    scheduleDays.set(s.workout_id, days)
  }

  return <WorkoutList workouts={workouts || []} scheduleDays={scheduleDays} />
}
