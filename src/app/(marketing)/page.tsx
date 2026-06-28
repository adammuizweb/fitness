import Link from 'next/link'
import { ArrowRight, GitFork, Sparkles } from 'lucide-react'
import { InteractiveFeatures } from '@/components/marketing/InteractiveFeatures'
import { I18nServer } from '@/lib/i18n/server'

const techStack = [
  { name: 'Next.js', href: 'https://nextjs.org' },
  { name: 'TypeScript', href: 'https://typescriptlang.org' },
  { name: 'Supabase', href: 'https://supabase.com' },
  { name: 'Tailwind CSS', href: 'https://tailwindcss.com' },
  { name: 'shadcn/ui', href: 'https://ui.shadcn.com' },
  { name: 'TanStack Query', href: 'https://tanstack.com/query' },
  { name: 'Recharts', href: 'https://recharts.org' },
  { name: 'Vercel', href: 'https://vercel.com' },
]

export default async function LandingPage() {
  const { t } = await I18nServer()

  return (
    <>
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
            <div className="order-2 md:order-1 animate-float" style={{ animationDelay: '0.5s' }}>
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
                  className="group relative inline-flex items-center justify-center h-12 px-8 rounded-xl bg-green-600 text-white font-semibold text-base
                    overflow-hidden transition-all duration-300 shadow-lg shadow-green-600/20
                    hover:shadow-xl hover:shadow-green-600/30 hover:scale-105 active:scale-95
                    animate-float-glow"
                  style={{ animationDelay: '1s' }}
                >
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      backgroundSize: '200% 100%',
                      animation: 'btn-shine 1.5s ease-in-out infinite',
                    }}
                  />
                  <span className="relative">{t('landing.hero.ctaStart')}</span>
                  <ArrowRight className="w-5 h-5 ml-2 relative group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="relative inline-flex items-center justify-center h-12 px-8 rounded-xl border-2 border-stone-300 text-stone-700 font-semibold text-base
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

      <section id="features" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14 animate-fade-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full text-xs text-green-600 font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive — click any card to learn more
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-stone-500 max-w-lg mx-auto">
              {t('landing.features.scheduleDesc').split('.')[0]}.
            </p>
          </div>

          <InteractiveFeatures />

          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-md">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-stone-100 bg-stone-50">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-stone-400 font-mono">workouts</span>
              </div>
              <img src="/screenshots/workouts.png" alt="Workouts" className="w-full h-auto" />
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-md">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-stone-100 bg-stone-50">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-stone-400 font-mono">streak</span>
              </div>
              <img src="/screenshots/streak.png" alt="Streak" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-t border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-6">
            {t('landing.stats.title')}
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {techStack.map((tech) => (
              <a
                key={tech.name}
                href={tech.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-stone-500 hover:text-green-600 transition-colors"
              >
                {tech.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-100 mb-6">
            <GitFork className="w-8 h-8 text-stone-700" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-lg text-stone-500 mb-8 max-w-lg mx-auto">
            {t('landing.cta.subtitle')}
          </p>
          <a
            href="https://github.com/adammuizweb/fitness"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-stone-900 text-white font-semibold text-base hover:bg-stone-800 transition-colors shadow-lg"
          >
            {t('landing.cta.ownIt')}
          </a>
        </div>
      </section>
    </>
  )
}
