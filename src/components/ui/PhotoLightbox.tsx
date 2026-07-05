'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'

interface Props {
  photos: string[]
  initialIndex?: number
  onClose: () => void
}

export function PhotoLightbox({ photos, initialIndex = 0, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex)
  const [imgError, setImgError] = useState(false)

  const goNext = useCallback(() => { setIndex((i) => (i + 1) % photos.length); setImgError(false) }, [photos.length])
  const goPrev = useCallback(() => { setIndex((i) => (i - 1 + photos.length) % photos.length); setImgError(false) }, [photos.length])

  useEffect(() => {
    setImgError(false)
  }, [index])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, goNext, goPrev])

  const current = photos[index]

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
      >
        <X className="w-6 h-6" />
      </button>

      {photos.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 text-white/70 hover:text-white transition-colors z-10 p-2"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 text-white/70 hover:text-white transition-colors z-10 p-2"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {current && !imgError && (
        <img
          src={current}
          alt=""
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
          onError={() => setImgError(true)}
        />
      )}

      {current && imgError && (
        <div
          className="flex flex-col items-center justify-center bg-gray-800 text-gray-400 rounded-lg w-48 h-48"
          onClick={(e) => e.stopPropagation()}
        >
          <ImageOff className="w-10 h-10 mb-2" />
          <span className="text-sm font-medium">Photo unavailable</span>
        </div>
      )}

      {photos.length > 1 && (
        <div className="absolute bottom-4 text-white/60 text-sm">
          {index + 1} / {photos.length}
        </div>
      )}
    </div>
  )
}
