'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useI18n } from '@/lib/i18n/context'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { useLogHistory } from '@/hooks/useLogs'
import { useStreak } from '@/hooks/useStreak'
import { Dumbbell, Flame, Camera, Pencil, X, Check, Loader2 } from 'lucide-react'

const supabase = createClient()

export default function ProfilePage() {
  const { t } = useI18n()
  const { profile, loading: profileLoading, refetch: refetchProfile } = useUser()
  const { data: history = [], isLoading: historyLoading } = useLogHistory()
  const { data: streak } = useStreak()
  const router = useRouter()

  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile) setFullName(profile.full_name || '')
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email)
    })
  }, [profile])

  async function handleAvatarUpload(file: File) {
    setUploadingAvatar(true)
    try {
      const { compressImage } = await import('@/lib/compressImage')
      const compressed = await compressImage(file, 150)
      const formData = new FormData()
      formData.append('file', compressed)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) return

      const data = await res.json()
      const url = data.urls[0]
      if (profile && url) {
        await supabase.from('profiles').update({ avatar_url: url }).eq('id', profile.id)
        refetchProfile()
      }
    } catch (err) {
      console.error('Avatar upload failed:', err)
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleSaveProfile() {
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', profile.id)
    setSaving(false)
    setEditing(false)
    refetchProfile()
  }

  const allPhotos = history.flatMap(log => log.photos || [])
  const totalWorkouts = history.length
  const currentStreak = streak?.current_streak || 0

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: t('nav.profile') },
      ]} />
      <div>
        <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleAvatarUpload(e.target.files[0])
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="w-16 h-16 rounded-full overflow-hidden bg-green-100 flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-5 h-5 animate-spin text-green-700" />
                ) : profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-green-700">
                    {profile?.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border">
                <Camera className="w-3.5 h-3.5 text-gray-500" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-2">
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('profile.fullName')}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveProfile} loading={saving}>
                      <Check className="w-4 h-4 mr-1" />
                      {t('profile.save')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                      <X className="w-4 h-4 mr-1" />
                      {t('profile.cancel')}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold">{profile?.full_name}</p>
                    <button
                      onClick={() => setEditing(true)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">@{profile?.username}</p>
                  <p className="text-xs text-gray-400 mt-1">{email}</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('profile.totalWorkouts')}</p>
              <p className="text-xl font-bold">{totalWorkouts}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('profile.currentStreak')}</p>
              <p className="text-xl font-bold">{currentStreak}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Photo Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            {t('profile.photos')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allPhotos.length === 0 ? (
            <div className="text-center py-8">
              <Camera className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{t('profile.noPhotos')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {allPhotos.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-square rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
