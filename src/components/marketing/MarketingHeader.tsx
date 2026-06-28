'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthModal } from './AuthModal'
import { useI18n } from '@/lib/i18n/context'
import { Dumbbell, Menu, X } from 'lucide-react'

export function MarketingHeader() {
  const { t, lang, setLang } = useI18n()
  const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  function switchLang(l: 'id' | 'en') {
    if (l === lang) return
    setLang(l)
    document.cookie = `fitness_lang=${l}; path=/; max-age=31536000`
    window.location.reload()
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-stone-900 font-semibold text-lg">
              <Dumbbell className="w-5 h-5 text-green-600" />
              {t('brand.name')}
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/#features" className="text-stone-600 hover:text-stone-900 transition-colors">
                {t('landing.features.title')}
              </Link>
              <Link href="/about" className="text-stone-600 hover:text-stone-900 transition-colors">
                {t('footer.about')}
              </Link>
              <Link href="/contact" className="text-stone-600 hover:text-stone-900 transition-colors">
                {t('footer.contact')}
              </Link>
              <div className="flex items-center gap-1 ml-4">
                <button
                  onClick={() => switchLang('id')}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    lang === 'id' ? 'bg-green-100 text-green-700 font-medium' : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  ID
                </button>
                <button
                  onClick={() => switchLang('en')}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    lang === 'en' ? 'bg-green-100 text-green-700 font-medium' : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  EN
                </button>
              </div>
              <button
                onClick={() => setShowAuth('login')}
                className="text-stone-600 hover:text-stone-900 font-medium transition-colors ml-4"
              >
                {t('landing.hero.ctaLogin')}
              </button>
              <button
                onClick={() => setShowAuth('register')}
                className="inline-flex items-center justify-center h-9 px-5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
              >
                {t('landing.hero.ctaStart')}
              </button>
            </nav>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <Link
                href="/#features"
                onClick={() => setMobileOpen(false)}
                className="block text-stone-600 hover:text-stone-900 py-2"
              >
                {t('landing.features.title')}
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="block text-stone-600 hover:text-stone-900 py-2"
              >
                {t('footer.about')}
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="block text-stone-600 hover:text-stone-900 py-2"
              >
                {t('footer.contact')}
              </Link>
              <div className="flex items-center gap-2 py-2">
                <button
                  onClick={() => switchLang('id')}
                  className={`px-3 py-1.5 text-sm rounded-md ${lang === 'id' ? 'bg-green-100 text-green-700 font-medium' : 'text-stone-500'}`}
                >
                  ID
                </button>
                <button
                  onClick={() => switchLang('en')}
                  className={`px-3 py-1.5 text-sm rounded-md ${lang === 'en' ? 'bg-green-100 text-green-700 font-medium' : 'text-stone-500'}`}
                >
                  EN
                </button>
              </div>
              <div className="flex gap-2 pt-2 border-t border-stone-100">
                <button
                  onClick={() => { setShowAuth('login'); setMobileOpen(false) }}
                  className="flex-1 h-10 rounded-lg border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-50"
                >
                  {t('landing.hero.ctaLogin')}
                </button>
                <button
                  onClick={() => { setShowAuth('register'); setMobileOpen(false) }}
                  className="flex-1 h-10 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
                >
                  {t('landing.hero.ctaStart')}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthModal
        open={showAuth !== null}
        onClose={() => setShowAuth(null)}
        defaultTab={showAuth || 'login'}
      />
    </>
  )
}
