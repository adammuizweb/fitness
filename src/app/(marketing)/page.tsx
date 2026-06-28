import Link from 'next/link'
import { Dumbbell, Calendar, CheckCircle2, Flame, Languages, Shield, ArrowRight, GitFork, Users, Share2, Camera, Moon, Lock } from 'lucide-react'
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

  const features = [
    { icon: Users, title: t('landing.features.socialTitle'), desc: t('landing.features.socialDesc') },
    { icon: Share2, title: t('landing.features.shareTitle'), desc: t('landing.features.shareDesc') },
    { icon: Dumbbell, title: t('landing.features.workoutTitle'), desc: t('landing.features.workoutDesc') },
    { icon: Calendar, title: t('landing.features.scheduleTitle'), desc: t('landing.features.scheduleDesc') },
    { icon: Camera, title: t('landing.features.photosTitle'), desc: t('landing.features.photosDesc') },
    { icon: Lock, title: t('landing.features.privacyTitle'), desc: t('landing.features.privacyDesc') },
    { icon: CheckCircle2, title: t('landing.features.logTitle'), desc: t('landing.features.logDesc') },
    { icon: Moon, title: t('landing.features.restTitle'), desc: t('landing.features.restDesc') },
    { icon: Flame, title: t('landing.features.streakTitle'), desc: t('landing.features.streakDesc') },
    { icon: Languages, title: t('landing.features.i18nTitle'), desc: t('landing.features.i18nDesc') },
    { icon: Shield, title: t('landing.features.adminTitle'), desc: t('landing.features.adminDesc') },
  ]

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#dcfce7,transparent_70%)]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28 relative">
          <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-center">
            <div className="md:col-span-2 order-2 md:order-1">
              <div className="rounded-2xl border border-stone-200 bg-white shadow-xl shadow-stone-200/50 overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-stone-100 bg-stone-50">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs text-stone-400 font-mono">dashboard</span>
                </div>
                <img src="/screenshots/dashboard.png" alt="Dashboard" className="w-full h-auto" />
              </div>
            </div>
            <div className="md:col-span-3 order-1 md:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-sm text-green-700 font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {t('brand.desc')}
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-stone-900 leading-tight tracking-tight mb-6">
                {t('landing.hero.title').split('\n').map((line, i) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {i === 1 ? <span className="text-green-600">{line}</span> : line}
                  </span>
                ))}
              </h1>
              <p className="text-lg text-stone-600 leading-relaxed max-w-lg mb-8">
                {t('landing.hero.subtitle')}
              </p>
              <div className="flex flex-wrap gap-3 items-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-green-600 text-white font-semibold text-base hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 hover:shadow-green-600/30"
                >
                  {t('landing.hero.ctaStart')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center h-12 px-8 rounded-xl border-2 border-stone-300 text-stone-700 font-semibold text-base hover:bg-stone-100 transition-colors"
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
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-stone-500 max-w-lg mx-auto">
              {t('landing.features.scheduleDesc').split('.')[0]}.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-stone-200 bg-white p-6 hover:shadow-lg hover:border-stone-300 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                  <f.icon className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-stone-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

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
