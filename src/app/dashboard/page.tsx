import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  const { data: logs } = await supabase
    .from('workout_logs')
    .select('*, workout:workouts(*)')
    .eq('user_id', user.id)
    .eq('logged_date', today)

  const { data: streak } = await supabase
    .from('daily_streaks')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { count: totalWorkouts } = await supabase
    .from('workouts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <DashboardClient
      logs={logs || []}
      streak={streak}
      totalWorkouts={totalWorkouts || 0}
    />
  )
}
