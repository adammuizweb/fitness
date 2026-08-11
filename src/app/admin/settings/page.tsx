'use client'

import type { FormEvent } from 'react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/lib/i18n/context'
import { useClearLoginRateLimits, useSecuritySettings, useUpdateSecuritySettings } from '@/hooks/useSecuritySettings'
import { Activity, Ban, ShieldCheck, Trash2 } from 'lucide-react'

export default function AdminSecuritySettingsPage() {
  const { t } = useI18n()
  const { data, isLoading, error } = useSecuritySettings()
  const updateMutation = useUpdateSecuritySettings()
  const clearMutation = useClearLoginRateLimits()

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">{t('common.loading')}</div>
  }

  if (!data || error) {
    return <div className="text-center py-8 text-red-500">{error?.message || t('adminSecurity.loadError')}</div>
  }

  const { settings, stats } = data

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    updateMutation.mutate({
      login_rate_limit_enabled: form.get('login_rate_limit_enabled') === 'on',
      account_max_attempts: Number(form.get('account_max_attempts')),
      ip_max_attempts: Number(form.get('ip_max_attempts')),
      attempt_window_minutes: Number(form.get('attempt_window_minutes')),
      block_minutes: Number(form.get('block_minutes')),
    })
  }

  function handleClear() {
    if (window.confirm(t('adminSecurity.clearConfirm'))) clearMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: t('nav.admin'), href: '/admin' },
        { label: t('admin.settings') },
      ]} />

      <div>
        <h1 className="text-2xl font-bold">{t('adminSecurity.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('adminSecurity.subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('adminSecurity.activeBuckets')}</p>
              <p className="text-2xl font-bold">{stats.activeBuckets}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Ban className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('adminSecurity.blockedBuckets')}</p>
              <p className="text-2xl font-bold">{stats.blockedBuckets}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            {t('adminSecurity.policy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form key={settings.updated_at} onSubmit={handleSubmit} className="space-y-5">
            <label className="flex items-start gap-3 rounded-lg border p-4 cursor-pointer">
              <input
                type="checkbox"
                name="login_rate_limit_enabled"
                defaultChecked={settings.login_rate_limit_enabled}
                className="mt-1 h-4 w-4 accent-green-600"
              />
              <span>
                <span className="font-medium block">{t('adminSecurity.enabled')}</span>
                <span className="text-sm text-gray-500">{t('adminSecurity.enabledDesc')}</span>
              </span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="account_max_attempts"
                name="account_max_attempts"
                type="number"
                min="1"
                max="100"
                required
                label={t('adminSecurity.accountAttempts')}
                defaultValue={settings.account_max_attempts}
              />
              <Input
                id="ip_max_attempts"
                name="ip_max_attempts"
                type="number"
                min="1"
                max="500"
                required
                label={t('adminSecurity.ipAttempts')}
                defaultValue={settings.ip_max_attempts}
              />
              <Input
                id="attempt_window_minutes"
                name="attempt_window_minutes"
                type="number"
                min="1"
                max="1440"
                required
                label={t('adminSecurity.windowMinutes')}
                defaultValue={settings.attempt_window_minutes}
              />
              <Input
                id="block_minutes"
                name="block_minutes"
                type="number"
                min="1"
                max="10080"
                required
                label={t('adminSecurity.blockMinutes')}
                defaultValue={settings.block_minutes}
              />
            </div>

            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
              {t('adminSecurity.baselineNote')}
            </p>

            {updateMutation.isSuccess && (
              <p className="text-sm text-green-600">{t('adminSecurity.saved')}</p>
            )}
            {updateMutation.error && (
              <p className="text-sm text-red-600">{updateMutation.error.message}</p>
            )}

            <Button type="submit" loading={updateMutation.isPending}>
              {t('common.save')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle>{t('adminSecurity.resetTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500">{t('adminSecurity.resetDesc')}</p>
          <Button variant="destructive" onClick={handleClear} loading={clearMutation.isPending}>
            <Trash2 className="w-4 h-4" />
            {t('adminSecurity.clear')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
