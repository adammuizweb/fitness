'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { useI18n } from '@/lib/i18n/context'
import { languages } from '@/lib/i18n/translations'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Dumbbell,
  ClipboardList,
  Flame,
  History,
  Settings,
  Shield,
  LogOut,
  Globe,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { profile } = useUser()
  const { t, lang, setLang } = useI18n()
  const [open, setOpen] = useState(false)

  const mobileItems = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/dashboard/workouts', label: t('nav.workouts'), icon: Dumbbell },
    { href: '/dashboard/log', label: t('nav.log'), icon: ClipboardList },
    { href: '/dashboard/log/history', label: t('nav.history'), icon: History },
    { href: '/dashboard/streak', label: t('nav.streak'), icon: Flame },
    { href: '/dashboard/settings', label: t('nav.settings'), icon: Settings },
  ]

  const otherLang = languages.find((l) => l.code !== lang)

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href + '/') || pathname === href
  }

  async function handleLogout() {
    setOpen(false)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200 flex items-center px-4">
        <button onClick={() => setOpen(!open)} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <span className="ml-2 font-bold">{t('brand.name')}</span>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)}>
          <div
            className="fixed left-0 top-14 bottom-0 w-64 bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {mobileItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}

              {profile?.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith('/admin')
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Shield className="w-5 h-5" />
                  {t('nav.admin')}
                </Link>
              )}
            </nav>

            <div className="p-4 border-t border-gray-100 space-y-2">
              {otherLang && (
                <button
                  onClick={() => { setLang(otherLang.code); setOpen(false) }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  {otherLang.flag} {otherLang.label}
                </button>
              )}
              <div className="flex items-center gap-3 px-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-green-700">
                    {profile?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{profile?.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">@{profile?.username}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
