import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { LogPageClient } from './LogPageClient'

export default async function LogPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]
  const todayDayOfWeek = new Date().getDay()

  const { data: schedules } = await supabase
    .from('workout_schedules')
    .select('*, workout:workouts(*)')
    .eq('user_id', user.id)
    .eq('day_of_week', todayDayOfWeek)

  const { data: todayLogs } = await supabase
    .from('workout_logs')
    .select('*, workout:workouts(*)')
    .eq('user_id', user.id)
    .eq('logged_date', today)

  return (
    <LogPageClient
      schedules={schedules || []}
      todayLogs={todayLogs || []}
    />
  )
}
