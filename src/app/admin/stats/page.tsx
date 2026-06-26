'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminStats } from '@/hooks/useAdmin'
import { Users, ClipboardList, Activity, TrendingUp } from 'lucide-react'

export default function AdminStatsPage() {
  const { data: stats, isLoading } = useAdminStats()

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Memuat statistik...</div>
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Statistik</h1>
          <p className="text-gray-500 text-sm mt-1">
            Untuk menampilkan statistik, buat function SQL get_admin_stats di Supabase
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-medium mb-1">Petunjuk:</p>
              <p>Jalankan SQL berikut di Supabase SQL Editor:</p>
                <pre className="mt-2 bg-blue-100 p-3 rounded text-xs overflow-x-auto">
{`CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'total_logs_today', (SELECT COUNT(*) FROM public.workout_logs WHERE logged_date = CURRENT_DATE AND is_done = TRUE),
    'total_logs_this_week', (SELECT COUNT(*) FROM public.workout_logs WHERE logged_date >= CURRENT_DATE - INTERVAL '7 days' AND is_done = TRUE),
    'total_logs_this_month', (SELECT COUNT(*) FROM public.workout_logs WHERE logged_date >= DATE_TRUNC('month', CURRENT_DATE) AND is_done = TRUE),
    'avg_logs_per_user', COALESCE((SELECT COUNT(*)::float / NULLIF(COUNT(DISTINCT user_id), 0) FROM public.workout_logs WHERE is_done = TRUE), 0),
    'top_exercises', (
      SELECT json_agg(json_build_object('name', w.name, 'count', cnt))
      FROM (
        SELECT wl.workout_id, COUNT(*) as cnt
        FROM public.workout_logs wl
        WHERE wl.is_done = TRUE
        GROUP BY wl.workout_id
        ORDER BY cnt DESC
        LIMIT 5
      ) top
      JOIN public.workouts w ON w.id = top.workout_id
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statistik</h1>
        <p className="text-gray-500 text-sm mt-1">Data penggunaan aplikasi</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{stats.total_users}</p>
              <p className="text-xs text-gray-500">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats.total_logs_today}</p>
              <p className="text-xs text-gray-500">Hari Ini</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.total_logs_this_week}</p>
              <p className="text-xs text-gray-500">Minggu Ini</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-2xl font-bold">{stats.total_logs_this_month}</p>
              <p className="text-xs text-gray-500">Bulan Ini</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.top_exercises && stats.top_exercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Exercises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.top_exercises.map((ex, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{ex.name}</span>
                  <span className="text-sm text-gray-500">{ex.count} log</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
