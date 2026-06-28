'use client'

import { useState } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { useI18n } from '@/lib/i18n/context'
import { X } from 'lucide-react'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  defaultTab?: 'login' | 'register'
}

export function AuthModal({ open, onClose, defaultTab = 'login' }: AuthModalProps) {
  const { t } = useI18n()
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              tab === 'login'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('landing.hero.ctaLogin')}
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              tab === 'register'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('landing.hero.ctaStart')}
          </button>
        </div>

        {tab === 'login' ? (
          <div>
            <h3 className="text-lg font-semibold mb-1">{t('landing.loginTitle')}</h3>
            <LoginForm />
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-1">{t('landing.registerTitle')}</h3>
            <RegisterForm />
          </div>
        )}
      </div>
    </div>
  )
}
