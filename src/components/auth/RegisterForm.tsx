'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/lib/i18n/context'

export function RegisterForm() {
  const { t } = useI18n()
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    full_name: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          username: form.username,
          full_name: form.full_name,
        },
      },
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    if (data.user?.identities?.length === 0) {
      setError(t('auth.registerEmailError'))
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
        label={t('registerForm.email')}
        type="email"
        placeholder={t('registerForm.emailPlaceholder')}
        autoComplete="username"
        value={form.email}
        onChange={(e) => updateField('email', e.target.value)}
        required
      />

      <Input
        id="username"
        label={t('registerForm.username')}
        type="text"
        placeholder={t('registerForm.usernamePlaceholder')}
        value={form.username}
        onChange={(e) => updateField('username', e.target.value)}
        required
      />

      <Input
        id="full_name"
        label={t('registerForm.fullName')}
        type="text"
        placeholder={t('registerForm.fullNamePlaceholder')}
        value={form.full_name}
        onChange={(e) => updateField('full_name', e.target.value)}
        required
      />

      <Input
        id="password"
        label={t('registerForm.password')}
        type="password"
        placeholder={t('registerForm.passwordPlaceholder')}
        autoComplete="new-password"
        value={form.password}
        onChange={(e) => updateField('password', e.target.value)}
        minLength={6}
        required
      />

      <Button type="submit" loading={loading} className="w-full">
        {t('registerForm.submit')}
      </Button>
    </form>
  )
}
