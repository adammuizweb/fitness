import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { WorkoutList } from '@/components/workouts/WorkoutList'

export default async function WorkoutsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const supabase = await createClient()

  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workouts</h1>
          <p className="text-gray-500 text-sm mt-1">
            Daftar exercise yang kamu miliki
          </p>
        </div>
      </div>

      <WorkoutList exercises={exercises || []} />
    </div>
  )
}
