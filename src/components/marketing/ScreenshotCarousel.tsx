'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { X } from 'lucide-react'

const slides = [
  { src: '/screenshots/dashboard.webp', label: 'Dashboard' },
  { src: '/screenshots/workouts.webp', label: 'Workouts' },
  { src: '/screenshots/streak.webp', label: 'Streak' },
  { src: '/screenshots/log.webp', label: 'Daily Log' },
  { src: '/screenshots/profile.webp', label: 'Profile' },
  { src: '/screenshots/posts.webp', label: 'Posts' },
  { src: '/screenshots/community.webp', label: 'Community' },
  { src: '/screenshots/settings.webp', label: 'Settings' },
  { src: '/screenshots/admin.webp', label: 'Admin' },
  { src: '/screenshots/dashboard_en.webp', label: 'English Dashboard' },
  { src: '/screenshots/admin_users.webp', label: 'User Management' },
  { src: '/screenshots/schedule.webp', label: 'Weekly Schedule' },
  { src: '/screenshots/photos_feature.webp', label: 'Workout Photos' },
  { src: '/screenshots/rest_days.webp', label: 'Rest Days' },
  { src: '/screenshots/language.webp', label: 'Multi Language' },
]

const allSlides = [...slides, ...slides]

export function ScreenshotCarousel() {
  const [selected, setSelected] = useState<{ src: string; label: string } | null>(null)

  return (
    <section className="py-16 overflow-hidden bg-white border-t border-stone-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-6">
        <p className="text-sm font-medium text-stone-400 uppercase tracking-widest text-center">
          See it in action — click any screenshot
        </p>
      </div>
      <div className="relative">
        <div className="flex gap-4 animate-carousel" style={{ width: `${allSlides.length * 320}px` }}>
          {allSlides.map((slide, i) => (
            <button
              key={i}
              onClick={() => setSelected(slide)}
              className="shrink-0 w-[300px] rounded-xl border border-stone-200 bg-white overflow-hidden shadow-md
                hover:shadow-xl hover:ring-2 hover:ring-green-400 hover:scale-[1.02]
                transition-all duration-300 text-left cursor-pointer"
            >
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-stone-100 bg-stone-50">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="ml-1.5 text-[10px] text-stone-400 font-mono truncate">{slide.label}</span>
              </div>
              <img src={slide.src} alt={slide.label} className="w-full h-auto"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!selected} onClose={() => setSelected(null)} size="xl">
        {selected && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-stone-600">{selected.label}</p>
              <button onClick={() => setSelected(null)} className="text-stone-400 hover:text-stone-600 transition-colors p-1 rounded-lg hover:bg-stone-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-xl border border-stone-200 overflow-hidden bg-stone-50">
              <img src={selected.src} alt={selected.label} className="w-full h-auto" />
            </div>
          </div>
        )}
      </Dialog>
    </section>
  )
}
