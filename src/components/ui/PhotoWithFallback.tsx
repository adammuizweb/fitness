'use client'

import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  src: string
  alt: string
  className?: string
  containerClassName?: string
}

export function PhotoWithFallback({ src, alt, className, containerClassName }: Props) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {status === 'loading' && (
        <div className={cn('animate-pulse bg-gray-200', className)} />
      )}

      {status === 'error' ? (
        <div className={cn(
          'flex flex-col items-center justify-center bg-gray-100 text-gray-400',
          className
        )}>
          <ImageOff className="w-5 h-5 mb-1 shrink-0" />
          <span className="text-[10px] font-medium">Photo unavailable</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            status === 'loading' ? 'opacity-0 absolute inset-0' : 'opacity-100',
            className
          )}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
    </div>
  )
}
