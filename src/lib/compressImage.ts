export async function compressImage(file: File, maxSizeKB = 300): Promise<Blob> {
  // Skip compression if already small enough
  if (file.size <= maxSizeKB * 1024) {
    return file
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    const cleanup = () => {
      URL.revokeObjectURL(url)
      img.onload = null
      img.onerror = null
    }

    img.onload = () => {
      let { width, height } = img
      const maxWidth = 1200
      if (width > maxWidth) {
        height = Math.round((height / width) * maxWidth)
        width = maxWidth
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        cleanup()
        reject(new Error('Could not get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Try WebP first, fall back to JPEG
      function tryCompress(mimeType: string, quality: number) {
        canvas.toBlob((blob) => {
          if (blob && blob.size <= maxSizeKB * 1024) {
            cleanup()
            resolve(blob)
            return
          }

          if (quality > 0.1) {
            tryCompress(mimeType, quality - 0.15)
          } else if (mimeType === 'image/webp') {
            // WebP failed or too large - fall back to JPEG
            tryCompress('image/jpeg', 0.8)
          } else {
            // JPEG at lowest quality - accept whatever we get
            canvas.toBlob((finalBlob) => {
              cleanup()
              if (finalBlob) resolve(finalBlob)
              else reject(new Error('Compression failed'))
            }, 'image/jpeg', 0.6)
          }
        }, mimeType, quality)
      }

      tryCompress('image/webp', 0.85)
    }

    img.onerror = () => {
      cleanup()
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}
