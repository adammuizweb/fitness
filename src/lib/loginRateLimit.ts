import { createHash } from 'node:crypto'
import type { NextRequest } from 'next/server'

export function getClientIp(request: NextRequest): string {
  const vercelForwarded = request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const realIp = request.headers.get('x-real-ip')?.trim()
  return (vercelForwarded || forwarded || realIp || 'unknown').slice(0, 128)
}

export function hashRateLimitKey(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export function normalizeLoginIdentifier(email: string): string {
  return email.trim().toLowerCase()
}
