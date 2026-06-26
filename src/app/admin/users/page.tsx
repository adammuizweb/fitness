'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAdminUsers } from '@/hooks/useAdmin'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Search } from 'lucide-react'
import type { Profile } from '@/types'

export default function AdminUsersPage() {
  const { data: users, isLoading } = useAdminUsers()
  const [search, setSearch] = useState('')
  const router = useRouter()

  const filtered = (users || []).filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Memuat...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kelola Users</h1>
        <p className="text-gray-500 text-sm mt-1">Total {users?.length || 0} user terdaftar</p>
      </div>

      <div className="max-w-xs">
        <Input
          id="search"
          placeholder="Cari username atau nama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bergabung</TableHead>
                <TableHead>Aksi</TableHead>
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
                      <Badge variant="banned">Banned</Badge>
                    ) : (
                      <Badge variant="active">Aktif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/users/${user.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
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
