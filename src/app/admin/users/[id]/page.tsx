'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useI18n } from '@/lib/i18n/context'
import { useAdminUsers, useUpdateUser } from '@/hooks/useAdmin'

export default function AdminUserEditPage() {
  const { t } = useI18n()
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: users } = useAdminUsers()
  const updateMutation = useUpdateUser()

  const found = users?.find((u) => u.id === id)
  const [role, setRole] = useState<string>(found?.role || 'user')

  if (!found) {
    return <div className="text-center py-8 text-gray-500">{t('adminEdit.notFound')}</div>
  }

  const user = found

  async function handleToggleBan() {
    await updateMutation.mutateAsync({
      id: user.id,
      is_banned: !user.is_banned,
    })
    router.refresh()
  }

  async function handleRoleChange(newRole: string) {
    setRole(newRole)
    await updateMutation.mutateAsync({
      id: user.id,
      role: newRole as 'user' | 'admin',
    })
    router.refresh()
  }

  return (
    <div className="space-y-6 max-w-lg">
      <Breadcrumb items={[
        { label: t('nav.admin'), href: '/admin' },
        { label: t('adminUsers.title'), href: '/admin/users' },
        { label: `@${user.username}` },
      ]} />
      <div>
        <h1 className="text-2xl font-bold">{t('adminEdit.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">@{user.username}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminEdit.info')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label={t('settings.fullName')} value={user.full_name || '-'} disabled />
          <Input label={t('settings.username')} value={`@${user.username}`} disabled />
          <Input label={t('adminUsers.tableJoined')} value={new Date(user.created_at).toLocaleDateString('id-ID')} disabled />

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">{t('adminEdit.role')}</label>
            <div className="flex gap-2">
              <Button
                variant={role === 'user' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRoleChange('user')}
              >
                {t('adminEdit.user')}
              </Button>
              <Button
                variant={role === 'admin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRoleChange('admin')}
              >
                {t('adminEdit.admin')}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">{t('adminEdit.status')}</label>
            {user.is_banned ? (
              <Badge variant="banned">{t('adminEdit.banned')}</Badge>
            ) : (
              <Badge variant="active">{t('adminEdit.active')}</Badge>
            )}
          </div>

          <Button
            variant={user.is_banned ? 'default' : 'destructive'}
            onClick={handleToggleBan}
            loading={updateMutation.isPending}
          >
            {user.is_banned ? t('adminEdit.activateBtn') : t('adminEdit.banBtn')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
