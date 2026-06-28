'use client'

import { useEffect, useRef } from 'react'

const slides = [
  { src: '/screenshots/dashboard.png', label: 'Dashboard' },
  { src: '/screenshots/workouts.png', label: 'Workouts' },
  { src: '/screenshots/streak.png', label: 'Streak' },
  { src: '/screenshots/log.png', label: 'Daily Log' },
  { src: '/screenshots/admin.png', label: 'Admin' },
  { src: '/screenshots/dashboard_en.png', label: 'English Dashboard' },
  { src: '/screenshots/admin_users.png', label: 'User Management' },
]

// Duplicate for seamless infinite scroll
const allSlides = [...slides, ...slides]

export function ScreenshotCarousel() {
  return (
    <section className="py-16 overflow-hidden bg-white border-t border-stone-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
        <p className="text-sm font-medium text-stone-400 uppercase tracking-widest text-center">
          See it in action
        </p>
      </div>
      <div className="relative">
        <div className="flex gap-4 animate-carousel" style={{ width: `${allSlides.length * 320}px` }}>
          {allSlides.map((slide, i) => (
            <div
              key={i}
              className="shrink-0 w-[300px] rounded-xl border border-stone-200 bg-white overflow-hidden shadow-md
                hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-stone-100 bg-stone-50">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="ml-1.5 text-[10px] text-stone-400 font-mono truncate">{slide.label}</span>
              </div>
              <img src={slide.src} alt={slide.label} className="w-full h-auto"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
