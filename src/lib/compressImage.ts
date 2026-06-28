export async function compressImage(file: File, maxSizeKB = 300): Promise<Blob> {
  if (file.size <= maxSizeKB * 1024) {
    return file
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    let cleanedUp = false

    const cleanup = () => {
      if (cleanedUp) return
      cleanedUp = true
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

      let quality = 0.85
      const tryWebP = () => {
        canvas.toBlob((blob) => {
          if (blob && blob.size <= maxSizeKB * 1024) {
            cleanup()
            resolve(blob)
            return
          }
          if (quality > 0.1) {
            quality -= 0.15
            tryWebP()
          } else {
            // Accept whatever size at lowest quality
            canvas.toBlob((finalBlob) => {
              cleanup()
              if (finalBlob) resolve(finalBlob)
              else reject(new Error('Compression failed'))
            }, 'image/webp', 0.1)
          }
        }, 'image/webp', quality)
      }

      tryWebP()
    }

    img.onerror = () => {
      cleanup()
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}
