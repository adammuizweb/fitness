export async function compressBase64(base64: string, fileType: string, _timeoutMs = 30000): Promise<{ data: string; type: string }> {
  const img = new Image()
  const url = `data:${fileType};base64,${base64}`

  return new Promise((resolve, reject) => {
    let done = false
    const finish = () => { if (done) return; done = true }

    img.onload = () => {
      let w = img.width, h = img.height
      const max = 1200
      if (w > max || h > max) {
        const r = Math.min(max / w, max / h)
        w = Math.round(w * r)
        h = Math.round(h * r)
      }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) { finish(); reject(new Error('Canvas error')); return }

      ctx.drawImage(img, 0, 0, w, h)

      // Try WebP first (toDataURL is synchronous and widely supported)
      let quality = 0.85
      const compressStep = (fmt: string) => {
        const mime = fmt === 'webp' ? 'image/webp' : 'image/jpeg'
        try {
          const dataUrl = canvas.toDataURL(mime, quality)
          const b64 = dataUrl.split(',')[1]

          if (quality <= 0.1) {
            finish()
            resolve({ data: b64, type: mime })
            return
          }

          // Estimate size from base64 length
          const bytes = Math.round((b64.length * 3) / 4)
          if (bytes <= 300 * 1024) {
            finish()
            resolve({ data: b64, type: mime })
            return
          }

          quality -= 0.15
          compressStep(fmt)
        } catch {
          if (fmt === 'webp') return compressStep('jpeg')
          finish()
          reject(new Error('Compression failed'))
        }
      }

      compressStep('webp')
    }

    img.onerror = () => { finish(); reject(new Error('Image load failed')) }
    img.src = url

    // Timeout
    setTimeout(() => { if (!done) { finish(); reject(new Error('Timeout')) } }, 30000)
  })
}
