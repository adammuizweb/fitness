'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useLogsByDate } from '@/hooks/useLogs'
import { LogList } from '@/components/logs/LogList'

export default function HistoryPage() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const { data: logs, isLoading } = useLogsByDate(date)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Riwayat Log</h1>
        <p className="text-gray-500 text-sm mt-1">Lihat log workout berdasarkan tanggal</p>
      </div>

      <div className="max-w-xs">
        <Input
          id="date"
          label="Pilih Tanggal"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Log {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500">Memuat...</p>
          ) : (
            <LogList logs={logs || []} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
