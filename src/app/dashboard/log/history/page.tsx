'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useI18n } from '@/lib/i18n/context'
import { useLogsByDate } from '@/hooks/useLogs'
import { LogList } from '@/components/logs/LogList'

export default function HistoryPage() {
  const { t } = useI18n()
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const { data: logs, isLoading } = useLogsByDate(date)

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: t('nav.log'), href: '/dashboard/log' },
        { label: t('nav.history') },
      ]} />
      <div>
        <h1 className="text-2xl font-bold">{t('logHistory.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('logHistory.subtitle')}</p>
      </div>

      <div className="max-w-xs">
        <Input
          id="date"
          label={t('logHistory.selectDate')}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500">{t('common.loading')}</p>
          ) : (
            <LogList logs={logs || []} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
