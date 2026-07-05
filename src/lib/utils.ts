import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const LOG_META_PREFIX = 'meta:log:'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
  }).format(new Date(date))
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Hari ini'
  if (days === 1) return 'Kemarin'
  return `${days} hari yang lalu`
}

export function getPostPhotos(photos: string[]): string[] {
  return photos.filter(p => !p.startsWith(LOG_META_PREFIX))
}

export function getPostLogIds(photos: string[]): string[] {
  return photos.filter(p => p.startsWith(LOG_META_PREFIX)).map(p => p.slice(LOG_META_PREFIX.length))
}
