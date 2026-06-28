'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { Dumbbell, GitFork } from 'lucide-react'

export function MarketingFooter() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-stone-900 font-semibold text-lg mb-3">
              <Dumbbell className="w-5 h-5 text-green-600" />
              {t('brand.name')}
            </div>
            <p className="text-sm text-stone-500 leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-stone-900 text-sm mb-3">{t('brand.fullName')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-stone-500 hover:text-stone-700 transition-colors">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-stone-500 hover:text-stone-700 transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-stone-500 hover:text-stone-700 transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-stone-500 hover:text-stone-700 transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-stone-900 text-sm mb-3">GitHub</h4>
            <a
              href="https://github.com/adammuizweb/fitness"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
            >
              <GitFork className="w-4 h-4" />
              {t('footer.source')}
            </a>
          </div>
        </div>

        <div className="border-t border-stone-200 mt-8 pt-8 text-center text-sm text-stone-400">
          &copy; {new Date().getFullYear()} {t('brand.fullName')}. {t('footer.copyright')}
        </div>
      </div>
    </footer>
  )
}
