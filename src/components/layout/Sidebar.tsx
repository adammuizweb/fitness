'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { useI18n } from '@/lib/i18n/context'
import {
  LayoutDashboard,
  Dumbbell,
  ClipboardList,
  Flame,
  Settings,
  Shield,
  LogOut,
  Globe,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { languages } from '@/lib/i18n/translations'

export function Sidebar() {
  const pathname = usePathname()
  const { profile } = useUser()
  const router = useRouter()
  const supabase = createClient()
  const { t, lang, setLang } = useI18n()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/dashboard/workouts', label: t('nav.workouts'), icon: Dumbbell },
    { href: '/dashboard/log', label: t('nav.log'), icon: ClipboardList },
    { href: '/dashboard/streak', label: t('nav.streak'), icon: Flame },
    { href: '/dashboard/log/history', label: t('nav.history'), icon: ClipboardList },
    { href: '/dashboard/settings', label: t('nav.settings'), icon: Settings },
  ]

  const otherLang = languages.find((l) => l.code !== lang)

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex-col">
      <div className="p-6 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">{t('brand.name')}</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}

        {profile?.role === 'admin' && (
          <Link
            href="/admin"
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
            onClick={() => setLang(otherLang.code)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <Globe className="w-4 h-4" />
            {otherLang.flag} {otherLang.label}
          </button>
        )}
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <span className="text-sm font-medium text-green-700">
              {profile?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.full_name}</p>
            <p className="text-xs text-gray-500 truncate">@{profile?.username}</p>
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {t('nav.logout')}
        </button>
      </div>
    </aside>
  )
}
