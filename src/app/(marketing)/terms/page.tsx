import { I18nServer } from '@/lib/i18n/server'
import { FileText } from 'lucide-react'

export default async function TermsPage() {
  const { t } = await I18nServer()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center">
          <FileText className="w-5 h-5 text-stone-700" />
        </div>
        <h1 className="text-3xl font-bold text-stone-900">{t('terms.title')}</h1>
      </div>

      <div className="space-y-6 text-stone-600 leading-relaxed">
        <p>{t('terms.intro')}</p>

        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900 mb-2">1. Usage</h2>
          <p className="text-sm">{t('terms.use')}</p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900 mb-2">2. Data Responsibility</h2>
          <p className="text-sm">{t('terms.data')}</p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900 mb-2">3. Changes</h2>
          <p className="text-sm">{t('terms.changes')}</p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900 mb-2">4. License</h2>
          <p className="text-sm">{t('terms.license')}</p>
          <a
            href="https://github.com/adammuizweb/fitness/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            {t('footer.source')} →
          </a>
        </div>
      </div>
    </div>
  )
}
