'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useI18n } from '@/lib/i18n/context'
import { Users, BarChart3, Shield } from 'lucide-react'

export default function AdminDashboard() {
  const { t } = useI18n()
  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: t('nav.admin') },
      ]} />
      <div>
        <h1 className="text-2xl font-bold">{t('admin.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('admin.subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/users">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">{t('admin.users')}</h3>
                <p className="text-sm text-gray-500">{t('admin.usersDesc')}</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/stats">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">{t('admin.stats')}</h3>
                <p className="text-sm text-gray-500">{t('admin.statsDesc')}</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="opacity-50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <Shield className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold">{t('admin.settings')}</h3>
              <p className="text-sm text-gray-500">{t('admin.settingsDesc')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
