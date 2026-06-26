'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  activeDates: Set<string>
}

export function StreakCalendar({ activeDates }: Props) {
  const weeks = useMemo(() => {
    const today = new Date()
    const sixMonthsAgo = new Date(today)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const days: { date: string; day: number; active: boolean }[] = []
    const current = new Date(sixMonthsAgo)

    while (current <= today) {
      const dateStr = current.toISOString().split('T')[0]
      days.push({
        date: dateStr,
        day: current.getDay(),
        active: activeDates.has(dateStr),
      })
      current.setDate(current.getDate() + 1)
    }

    const weekCount = Math.ceil(days.length / 7)
    const weeks: typeof days[] = []
    for (let w = 0; w < weekCount; w++) {
      weeks.push(days.slice(w * 7, (w + 1) * 7))
    }
    return weeks
  }, [activeDates])

  const monthLabels = useMemo(() => {
    const labels: { label: string; index: number }[] = []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

    weeks.forEach((week, i) => {
      if (week.length > 0) {
        const date = new Date(week[0].date)
        if (date.getDate() <= 7) {
          labels.push({ label: months[date.getMonth()], index: i })
        }
      }
    })

    return labels
  }, [weeks])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kalender Aktivitas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            <div className="flex flex-col gap-1 mr-2">
              <div className="h-4" />
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
                <div key={d} className="h-3 text-[10px] text-gray-400 leading-3">{d}</div>
              ))}
            </div>
            <div className="flex gap-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, di) => {
                    const day = week[di]
                    return (
                      <div
                        key={di}
                        className={`w-3 h-3 rounded-sm ${
                          day?.active
                            ? 'bg-green-500'
                            : day
                            ? 'bg-gray-100'
                            : 'bg-transparent'
                        }`}
                        title={day?.date || ''}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-1 mt-2 ml-8">
            {monthLabels.map((m) => (
              <span key={m.label} className="text-[10px] text-gray-400" style={{ marginLeft: m.index * 16 - (monthLabels.indexOf(m) > 0 ? 8 : 0) }}>
                {m.label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
          <span>Kurang</span>
          <div className="w-3 h-3 rounded-sm bg-gray-100" />
          <div className="w-3 h-3 rounded-sm bg-green-200" />
          <div className="w-3 h-3 rounded-sm bg-green-400" />
          <div className="w-3 h-3 rounded-sm bg-green-600" />
          <span>Banyak</span>
        </div>
      </CardContent>
    </Card>
  )
}
