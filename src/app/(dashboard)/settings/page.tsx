'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const { profile, loading } = useUser()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email)
    })
  }, [supabase])

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)

    await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', profile.id)

    setSaving(false)
    router.refresh()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Memuat...</div>
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-gray-500 text-sm mt-1">Atur profil akunmu</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              id="email"
              label="Email"
              value={email}
              disabled
            />
            <Input
              id="username"
              label="Username"
              value={`@${profile?.username || ''}`}
              disabled
            />
            <Input
              id="full_name"
              label="Nama Lengkap"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Button type="submit" loading={saving}>
              Simpan
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Keluar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Keluar dari aplikasi Fitnes Tracker
          </p>
          <Button variant="destructive" onClick={handleLogout}>
            Keluar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
