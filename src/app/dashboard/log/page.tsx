import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { LogPageClient } from './LogPageClient'

export default async function LogPage() {
  const user = await getCurrentUser()
  const supabase = await createClient()

  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .eq('user_id', user!.id)
    .order('name')

  const today = new Date().toISOString().split('T')[0]
  const { data: todayLogs } = await supabase
    .from('workout_logs')
    .select('*, exercise:exercises(*)')
    .eq('user_id', user!.id)
    .eq('logged_date', today)

  return (
    <LogPageClient
      exercises={exercises || []}
      todayLogs={todayLogs || []}
    />
  )
}
