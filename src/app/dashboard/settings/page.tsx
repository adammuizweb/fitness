'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import { languages } from '@/lib/i18n/translations'
import { Globe, LogOut } from 'lucide-react'

export default function SettingsPage() {
  const { t, lang, setLang } = useI18n()
  const router = useRouter()
  const supabase = createClient()

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
