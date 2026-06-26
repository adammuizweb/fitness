'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function RegisterForm() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    full_name: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
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
      setError('Email sudah terdaftar')
      return
    }

    router.push('/dashboard')
    router.refresh()
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
        label="Email"
        type="email"
        placeholder="nama@email.com"
        value={form.email}
        onChange={(e) => updateField('email', e.target.value)}
        required
      />

      <Input
        id="username"
        label="Username"
        type="text"
        placeholder="namaku"
        value={form.username}
        onChange={(e) => updateField('username', e.target.value)}
        required
      />

      <Input
        id="full_name"
        label="Nama Lengkap"
        type="text"
        placeholder="Nama Lengkap"
        value={form.full_name}
        onChange={(e) => updateField('full_name', e.target.value)}
        required
      />

      <Input
        id="password"
        label="Password"
        type="password"
        placeholder="Minimal 6 karakter"
        value={form.password}
        onChange={(e) => updateField('password', e.target.value)}
        minLength={6}
        required
      />

      <Button type="submit" loading={loading} className="w-full">
        Daftar
      </Button>
    </form>
  )
}
