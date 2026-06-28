'use client'

import { useMemo, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n/context'

interface Props {
  activeDates: Set<string>
}

export function StreakCalendar({ activeDates }: Props) {
  const { t, months, days } = useI18n()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [])

  const weeks = useMemo(() => {
    const today = new Date()
    const sixMonthsAgo = new Date(today)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const daysArr: { date: string; day: number; active: boolean }[] = []
    const current = new Date(sixMonthsAgo)

    while (current <= today) {
      const dateStr = current.toISOString().split('T')[0]
      daysArr.push({
        date: dateStr,
        day: current.getDay(),
        active: activeDates.has(dateStr),
      })
      current.setDate(current.getDate() + 1)
    }

    const weekCount = Math.ceil(daysArr.length / 7)
    const weeks: typeof daysArr[] = []
    for (let w = 0; w < weekCount; w++) {
      weeks.push(daysArr.slice(w * 7, (w + 1) * 7))
    }
    return weeks
  }, [activeDates])

  const monthLabels = useMemo(() => {
    const labels: { label: string; index: number }[] = []

    weeks.forEach((week, i) => {
      if (week.length > 0) {
        const date = new Date(week[0].date)
        if (date.getDate() <= 7) {
          labels.push({ label: months.short[date.getMonth()], index: i })
        }
      }
    })

    return labels
  }, [weeks, months])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('streak.calendar')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={scrollRef} className="overflow-x-auto">
          <div className="inline-flex gap-1">
            <div className="flex flex-col gap-1 mr-2">
              <div className="h-4" />
              {days.short.map((d) => (
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
          <span>{t('streak.less')}</span>
          <div className="w-3 h-3 rounded-sm bg-gray-100" />
          <div className="w-3 h-3 rounded-sm bg-green-200" />
          <div className="w-3 h-3 rounded-sm bg-green-400" />
          <div className="w-3 h-3 rounded-sm bg-green-600" />
          <span>{t('streak.more')}</span>
        </div>
      </CardContent>
    </Card>
  )
}
