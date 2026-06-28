import Link from 'next/link'
import { GitFork, ExternalLink } from 'lucide-react'
import { I18nServer } from '@/lib/i18n/server'

export async function CTASection() {
  const { t } = await I18nServer()

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#dcfce7,transparent_60%)]" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-50 mb-6 ring-1 ring-stone-200">
          <GitFork className="w-8 h-8 text-stone-700" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
          {t('landing.cta.title')}
        </h2>
        <p className="text-lg text-stone-500 mb-8 max-w-lg mx-auto">
          {t('landing.cta.subtitle')}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="group inline-flex items-center justify-center h-12 px-8 rounded-xl
              bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-base
              hover:from-green-700 hover:to-emerald-700 hover:scale-105 active:scale-95
              transition-all duration-300 shadow-lg shadow-green-600/20"
          >
            {t('landing.hero.ctaStart')}
            <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="https://github.com/adammuizweb/fitness"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-12 px-8 rounded-xl
              bg-white border-2 border-stone-300 text-stone-700 font-semibold text-base
              hover:border-green-500 hover:text-green-700 hover:bg-green-50 hover:scale-105 active:scale-95
              transition-all duration-300 shadow-md"
          >
            <GitFork className="w-5 h-5 mr-2" />
            {t('landing.cta.ownIt')}
          </a>
        </div>
      </div>
    </section>
  )
}
