export async function compressImage(file: File, maxSizeKB = 300): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

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
        reject(new Error('Could not get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      let quality = 0.85
      const mimeType = 'image/webp'

      function attemptCompress() {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'))
              return
            }

            if (blob.size <= maxSizeKB * 1024 || quality <= 0.1) {
              const compressed = new File([blob], 'photo.webp', { type: mimeType })
              resolve(compressed)
            } else {
              quality -= 0.1
              attemptCompress()
            }
          },
          mimeType,
          quality
        )
      }

      attemptCompress()
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}
