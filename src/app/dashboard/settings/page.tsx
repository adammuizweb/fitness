'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useI18n } from '@/lib/i18n/context'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { languages } from '@/lib/i18n/translations'
import { Globe, LogOut, Shield, ChevronDown, ChevronUp } from 'lucide-react'
const supabase = createClient()

export default function SettingsPage() {
  const { t, lang, setLang } = useI18n()
  const { profile, refetch } = useUser()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [showRules, setShowRules] = useState(false)

  async function toggleVisibility() {
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({ is_public: !profile.is_public }).eq('id', profile.id)
    setSaving(false)
    refetch()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="space-y-6 max-w-lg">
      <Breadcrumb items={[
        { label: t('nav.settings') },
      ]} />
      <div>
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('settings.subtitle')}</p>
      </div>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t('settings.language')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  lang === l.code
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{l.flag}</span>
                <div>
                  <p className="font-medium">{l.label}</p>
                  <p className="text-sm text-gray-400">{l.code === 'en' ? 'English' : 'Bahasa Indonesia'}</p>
                </div>
                {lang === l.code && (
                  <span className="ml-auto text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t('settings.privacy')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">{t('settings.privacyDesc')}</p>

          {/* Profile visibility toggle */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {profile?.is_public ? t('settings.publicProfile') : t('settings.privateProfile')}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {profile?.is_public ? t('settings.publicProfileDesc') : t('settings.privateProfileDesc')}
                </p>
              </div>
              <button
                onClick={toggleVisibility}
                disabled={saving}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  profile?.is_public ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    profile?.is_public ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Privacy rules accordion */}
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setShowRules(!showRules)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('settings.privacyRules')}
              {showRules ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showRules && (
              <div className="px-4 pb-4 space-y-3">
                <div className="flex gap-3">
                  <span className="text-red-500 font-bold shrink-0">1.</span>
                  <p className="text-sm text-gray-600">{t('settings.privacyRule1')}</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-500 font-bold shrink-0">2.</span>
                  <p className="text-sm text-gray-600">{t('settings.privacyRule2')}</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-500 font-bold shrink-0">3.</span>
                  <p className="text-sm text-gray-600">{t('settings.privacyRule3')}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <LogOut className="w-5 h-5" />
            {t('settings.logout')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            {t('settings.logoutDesc')}
          </p>
          <Button variant="destructive" onClick={handleLogout}>
            {t('settings.logoutBtn')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
