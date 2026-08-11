'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface SecuritySettings {
  id: number
  login_rate_limit_enabled: boolean
  account_max_attempts: number
  ip_max_attempts: number
  attempt_window_minutes: number
  block_minutes: number
  updated_at: string
  updated_by: string | null
}

export interface SecuritySettingsResponse {
  settings: SecuritySettings
  stats: {
    blockedBuckets: number
    activeBuckets: number
  }
}

async function fetchSecuritySettings(): Promise<SecuritySettingsResponse> {
  const response = await fetch('/api/admin/security-settings', { cache: 'no-store' })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Failed to load security settings')
  return result
}

async function updateSecuritySettings(settings: Omit<SecuritySettings, 'id' | 'updated_at' | 'updated_by'>) {
  const response = await fetch('/api/admin/security-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Failed to save security settings')
  return result
}

async function clearLoginRateLimits() {
  const response = await fetch('/api/admin/security-settings', { method: 'DELETE' })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Failed to clear login rate limits')
  return result
}

export function useSecuritySettings() {
  return useQuery({
    queryKey: ['admin', 'security-settings'],
    queryFn: fetchSecuritySettings,
  })
}

export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateSecuritySettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'security-settings'] }),
  })
}

export function useClearLoginRateLimits() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: clearLoginRateLimits,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'security-settings'] }),
  })
}
