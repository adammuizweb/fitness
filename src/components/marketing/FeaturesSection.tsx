'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { useI18n } from '@/lib/i18n/context'
import {
  Users, Share2, Dumbbell, Calendar, Camera, Lock,
  CheckCircle2, Moon, Flame, Languages, Shield, X, Sparkles,
} from 'lucide-react'

interface Feature {
  num: string
  icon: React.ReactNode
  title: string
  desc: string
  detail: string
  screenshot?: string
}

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function FeatureCard({ feature, index, onClick }: { feature: Feature; index: number; onClick: () => void }) {
  const { ref, inView } = useInView()
  const delay = index * 60

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`group relative rounded-2xl border border-stone-200 bg-white p-6 cursor-pointer
        transition-all duration-500 ease-out
        hover:shadow-xl hover:border-green-300 hover:-translate-y-1
        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Number badge */}
      <div className="absolute top-4 right-4 text-3xl font-black text-stone-100 select-none
        group-hover:text-green-100 transition-colors duration-300">
        {feature.num}
      </div>

      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-4
        group-hover:bg-green-100 group-hover:scale-110 transition-all duration-300">
        <div className="text-green-600 group-hover:scale-110 transition-transform duration-300">
          {feature.icon}
        </div>
      </div>
      <h3 className="font-semibold text-stone-900 mb-1.5 group-hover:text-green-700 transition-colors relative z-10">
        {feature.title}
      </h3>
      <p className="text-sm text-stone-500 leading-relaxed relative z-10">{feature.desc}</p>
    </div>
  )
}

export function FeaturesSection() {
  const { t } = useI18n()
  const [selected, setSelected] = useState<Feature | null>(null)

  const features: Feature[] = [
    { num: '01', icon: <Users className="w-5 h-5" />, title: t('landing.features.socialTitle'), desc: t('landing.features.socialDesc'), detail: 'Follow other members, share your workout activity, and engage with the community. Public profiles show your shared workouts and posts. Privacy controls let you choose who sees what.', screenshot: '/screenshots/community.png' },
    { num: '02', icon: <Share2 className="w-5 h-5" />, title: t('landing.features.shareTitle'), desc: t('landing.features.shareDesc'), detail: 'Share individual workout templates or your full weekly schedule plan. Other members can browse your shared content on your public profile and copy it instantly to their own workout list.' },
    { num: '03', icon: <Dumbbell className="w-5 h-5" />, title: t('landing.features.workoutTitle'), desc: t('landing.features.workoutDesc'), detail: 'Create custom workout templates for lifting or cardio. Set default sets, reps, weight, distance, and duration. Organize your routine and reuse them daily.', screenshot: '/screenshots/workouts.png' },
    { num: '04', icon: <Calendar className="w-5 h-5" />, title: t('landing.features.scheduleTitle'), desc: t('landing.features.scheduleDesc'), detail: 'Assign workouts to specific days of the week. Your daily checklist updates automatically. Mark rest days and let the app auto-complete them so recovery counts toward your streak.' },
    { num: '05', icon: <Camera className="w-5 h-5" />, title: t('landing.features.photosTitle'), desc: t('landing.features.photosDesc'), detail: 'Take or upload photos directly from your phone during workouts. Images are automatically compressed to WebP format (≤300KB) and stored securely on our private CDN.' },
    { num: '06', icon: <Lock className="w-5 h-5" />, title: t('landing.features.privacyTitle'), desc: t('landing.features.privacyDesc'), detail: 'Full privacy control. Set your profile to public or private. Each post has its own audience selector: Only Me, Followers, Friends (mutual follows), or Everyone. Private profiles are completely invisible.' },
    { num: '07', icon: <CheckCircle2 className="w-5 h-5" />, title: t('landing.features.logTitle'), desc: t('landing.features.logDesc'), detail: 'Your daily workout checklist shows all scheduled exercises. Check them off, edit sets/reps inline, and add photos. If you already logged a workout on a rest day, the rest is skipped automatically.', screenshot: '/screenshots/log.png' },
    { num: '08', icon: <Moon className="w-5 h-5" />, title: t('landing.features.restTitle'), desc: t('landing.features.restDesc'), detail: 'Designate specific days of the week as rest days. On those days, the checklist auto-completes so you can focus on recovery. If you already worked out, rest day is skipped.' },
    { num: '09', icon: <Flame className="w-5 h-5" />, title: t('landing.features.streakTitle'), desc: t('landing.features.streakDesc'), detail: 'GitHub-style activity calendar showing your daily consistency. Current and longest streaks are displayed prominently. Stay motivated by watching your streak grow day by day.', screenshot: '/screenshots/streak.png' },
    { num: '10', icon: <Languages className="w-5 h-5" />, title: t('landing.features.i18nTitle'), desc: t('landing.features.i18nDesc'), detail: 'The entire interface is available in English and Indonesian. Switch anytime from the settings page. Your language preference is remembered across sessions.' },
    { num: '11', icon: <Shield className="w-5 h-5" />, title: t('landing.features.adminTitle'), desc: t('landing.features.adminDesc'), detail: 'Full admin dashboard for managing users, viewing platform statistics, and controlling settings. Ban/unban users, change roles, and monitor usage metrics in real-time.', screenshot: '/screenshots/admin.png' },
  ]

  return (
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} onClick={() => setSelected(f)} />
          ))}
        </div>
      </div>

      <Dialog open={!!selected} onClose={() => setSelected(null)} title="">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center shrink-0 border border-green-100">
                <div className="text-green-600 w-5 h-5">{selected.icon}</div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">{selected.num}</span>
                  <h3 className="text-lg font-bold text-stone-900">{selected.title}</h3>
                </div>
                <p className="text-sm text-stone-500 mt-2 leading-relaxed">{selected.detail}</p>
              </div>
            </div>

            {selected.screenshot && (
              <div className="rounded-xl border border-stone-200 overflow-hidden bg-stone-50">
                <div className="flex items-center gap-1.5 px-4 py-2 border-b border-stone-100 bg-stone-50">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <img src={selected.screenshot} alt={selected.title} className="w-full h-auto"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            )}

            <div className="flex justify-end">
              <button onClick={() => setSelected(null)}
                className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors">
                <X className="w-4 h-4" /> Close
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </section>
  )
}
