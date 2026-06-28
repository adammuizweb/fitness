import { I18nServer } from '@/lib/i18n/server'
import { Shield } from 'lucide-react'

export default async function PrivacyPage() {
  const { t } = await I18nServer()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
          <Shield className="w-5 h-5 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-stone-900">{t('privacy.title')}</h1>
      </div>

      <div className="space-y-6 text-stone-600 leading-relaxed">
        <p>{t('privacy.intro')}</p>

        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900 mb-2">1. {t('privacy.data').split(':')[0]}</h2>
          <p className="text-sm">{t('privacy.data')}</p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900 mb-2">2. Data Sharing</h2>
          <p className="text-sm">{t('privacy.sharing')}</p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900 mb-2">3. Cookies</h2>
          <p className="text-sm">{t('privacy.cookies')}</p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900 mb-2">4. Data Retention & Deletion</h2>
          <p className="text-sm">{t('privacy.retention')}</p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900 mb-2">5. Your Rights</h2>
          <p className="text-sm">{t('privacy.rights')}</p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900 mb-2">6. Policy Changes</h2>
          <p className="text-sm">{t('privacy.changes')}</p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900 mb-2">7. Contact</h2>
          <p className="text-sm">{t('privacy.contact')}</p>
        </div>
      </div>
    </div>
  )
}
