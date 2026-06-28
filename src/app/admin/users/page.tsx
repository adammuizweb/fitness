'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useI18n } from '@/lib/i18n/context'
import { useAdminUsers } from '@/hooks/useAdmin'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import type { Profile } from '@/types'

export default function AdminUsersPage() {
  const { t } = useI18n()
  const { data: users, isLoading } = useAdminUsers()
  const [search, setSearch] = useState('')

  const filtered = (users || []).filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">{t('common.loading')}</div>
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: t('nav.admin'), href: '/admin' },
        { label: t('adminUsers.title') },
      ]} />
      <div>
        <h1 className="text-2xl font-bold">{t('adminUsers.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('adminUsers.total', { count: users?.length || 0 })}</p>
      </div>

      <div className="max-w-xs">
        <Input
          id="search"
          placeholder={t('adminUsers.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('adminUsers.tableUser')}</TableHead>
                <TableHead>{t('adminUsers.tableRole')}</TableHead>
                <TableHead>{t('adminUsers.tableStatus')}</TableHead>
                <TableHead>{t('adminUsers.tableJoined')}</TableHead>
                <TableHead>{t('adminUsers.tableActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user: Profile) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.full_name || '-'}</p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'admin' : 'user'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.is_banned ? (
                      <Badge variant="banned">{t('adminEdit.banned')}</Badge>
                    ) : (
                      <Badge variant="active">{t('adminEdit.active')}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/users/${user.id}`}>
                      <Button variant="outline" size="sm">
                        {t('adminUsers.editBtn')}
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
