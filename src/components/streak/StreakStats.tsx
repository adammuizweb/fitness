import { Card, CardContent } from '@/components/ui/card'
import { Flame, Trophy, Calendar } from 'lucide-react'
import type { DailyStreak } from '@/types'

interface Props {
  streak: DailyStreak | null
}

export function StreakStats({ streak }: Props) {
  const current = streak?.current_streak || 0
  const longest = streak?.longest_streak || 0

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <Flame className={`w-8 h-8 ${current >= 7 ? 'text-orange-500' : 'text-gray-400'}`} />
          </div>
          <p className="text-3xl font-bold">{current}</p>
          <p className="text-xs text-gray-500 mt-1">Streak Saat Ini</p>
          {current >= 7 && (
            <p className="text-xs text-orange-600 font-medium mt-1">🔥 On Fire!</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold">{longest}</p>
          <p className="text-xs text-gray-500 mt-1">Longest Streak</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">
            {streak?.last_activity_date
              ? new Date(streak.last_activity_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
              : '-'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Terakhir</p>
        </CardContent>
      </Card>
    </div>
  )
}
