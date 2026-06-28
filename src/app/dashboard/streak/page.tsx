import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { StreakClient } from './StreakClient'

export default async function StreakPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const supabase = await createClient()

  const { data: streak } = await supabase
    .from('daily_streaks')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const since = sixMonthsAgo.toISOString().split('T')[0]

  const { data: logs } = await supabase
    .from('workout_logs')
    .select('logged_date')
    .eq('user_id', user.id)
    .gte('logged_date', since)
    .order('logged_date')

  const activeDates = new Set(logs?.map((l) => l.logged_date) || [])

  return <StreakClient streak={streak} activeDates={activeDates} />
}
