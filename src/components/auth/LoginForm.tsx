'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/lib/i18n/context'

export function LoginForm() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    let response: Response
    try {
      response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
    } catch {
      setLoading(false)
      setError(t('auth.loginUnavailable'))
      return
    }

    const result = await response.json().catch(() => ({ error: 'unknown' }))

    setLoading(false)

    if (!response.ok) {
      if (result.error === 'rate_limited') {
        setError(t('auth.loginRateLimited', { minutes: Math.max(1, Math.ceil((result.retryAfter || 60) / 60)) }))
      } else if (result.error === 'account_banned') {
        setError(t('auth.loginBanned'))
      } else if (result.error === 'security_unavailable') {
        setError(t('auth.loginUnavailable'))
      } else {
        setError(t('auth.loginError'))
      }
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Input
        id="email"
        label={t('loginForm.email')}
        type="email"
        placeholder={t('loginForm.emailPlaceholder')}
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        id="password"
        label={t('loginForm.password')}
        type="password"
        placeholder={t('loginForm.passwordPlaceholder')}
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <Button type="submit" loading={loading} className="w-full">
        {t('loginForm.submit')}
      </Button>
    </form>
  )
}
