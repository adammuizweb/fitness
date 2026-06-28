import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { I18nServer } from '@/lib/i18n/server'

export async function HeroSection() {
  const { t } = await I18nServer()

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#dcfce7,transparent_70%)]" />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, #16a34a 1px, transparent 1px), radial-gradient(circle at 75% 75%, #16a34a 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28 relative">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Screenshot */}
          <div className="order-2 md:order-1 animate-screenshot-float">
            <div className="rounded-2xl border border-stone-200 bg-white shadow-xl shadow-green-600/10 overflow-hidden
              hover:shadow-2xl hover:shadow-green-600/20 transition-shadow duration-500">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-stone-100 bg-stone-50">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-stone-400 font-mono">dashboard</span>
              </div>
              <img src="/screenshots/dashboard.png" alt="Dashboard" className="w-full h-auto" />
            </div>
          </div>

          {/* Text */}
          <div className="order-1 md:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-sm text-green-700 font-medium mb-6 animate-fade-slide-up" style={{ animationDelay: '0ms' }}>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-glow" />
              {t('brand.desc')}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-stone-900 leading-tight tracking-tight mb-6 animate-fade-slide-up" style={{ animationDelay: '100ms' }}>
              {t('landing.hero.title').split('\n').map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {i === 1 ? <span className="text-green-600">{line}</span> : line}
                </span>
              ))}
            </h1>
            <p className="text-lg text-stone-600 leading-relaxed max-w-lg mb-8 animate-fade-slide-up" style={{ animationDelay: '200ms' }}>
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4 items-center animate-fade-slide-up" style={{ animationDelay: '300ms' }}>
              <Link
                href="/register"
                className="group relative inline-flex items-center justify-center h-12 px-8 rounded-xl
                  bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-base
                  animate-btn-beat
                  hover:from-green-700 hover:to-emerald-700 hover:scale-105 active:scale-95
                  transition-all duration-300 shadow-lg"
              >
                <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
                  animate-btn-shimmer"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                  }}
                />
                <span className="relative">{t('landing.hero.ctaStart')}</span>
                <ArrowRight className="w-5 h-5 ml-2 relative group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="relative inline-flex items-center justify-center h-12 px-8 rounded-xl
                  border-2 border-stone-300 text-stone-700 font-semibold text-base
                  transition-all duration-300
                  hover:border-green-500 hover:text-green-700 hover:bg-green-50 hover:scale-105 active:scale-95
                  shadow-md hover:shadow-lg hover:shadow-green-600/10"
              >
                {t('landing.hero.ctaLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
