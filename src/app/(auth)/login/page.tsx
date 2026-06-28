'use client'

import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'
import { useI18n } from '@/lib/i18n/context'
import { Flame } from 'lucide-react'

export default function LoginPage() {
  const { t } = useI18n()
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
              <Flame className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">{t('auth.loginTitle')}</h1>
          <p className="text-sm text-gray-500">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <LoginForm />
        </div>

        <p className="text-center text-sm text-gray-500">
          {t('auth.loginNoAccount')}{' '}
          <Link href="/register" className="text-green-600 font-medium hover:underline">
            {t('auth.loginRegister')}
          </Link>
        </p>
      </div>
    </div>
  )
}
