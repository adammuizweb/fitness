import { I18nServer } from '@/lib/i18n/server'
import { Mail, GitFork } from 'lucide-react'

export default async function ContactPage() {
  const { t } = await I18nServer()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <h1 className="text-3xl font-bold text-stone-900 mb-8">{t('contact.title')}</h1>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <a
          href="mailto:mail@adammuiz.com"
          className="rounded-2xl border border-stone-200 bg-white p-6 hover:shadow-md hover:border-stone-300 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
            <Mail className="w-5 h-5 text-green-600" />
          </div>
          <div className="font-medium text-stone-900 mb-1">{t('contact.email')}</div>
          <div className="text-sm text-stone-500">mail@adammuiz.com</div>
        </a>

        <a
          href="https://github.com/adammuizweb/fitness"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-stone-200 bg-white p-6 hover:shadow-md hover:border-stone-300 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center mb-4 group-hover:bg-stone-100 transition-colors">
            <GitFork className="w-5 h-5 text-stone-700" />
          </div>
          <div className="font-medium text-stone-900 mb-1">{t('contact.github')}</div>
          <div className="text-sm text-stone-500">adammuizweb/fitness</div>
        </a>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
        <p className="text-stone-600 text-sm">{t('contact.openSource')}</p>
      </div>
    </div>
  )
}
