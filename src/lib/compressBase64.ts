export async function compressBase64(base64: string, fileType: string): Promise<{ data: string; type: string }> {
  const img = new Image()
  const url = `data:${fileType};base64,${base64}`

  return new Promise((resolve, reject) => {
    let done = false
    const timeout = setTimeout(() => { if (!done) { done = true; reject(new Error('Timeout')) } }, 30000)

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
      if (!ctx) { clearTimeout(timeout); done = true; reject(new Error('Canvas error')); return }

      ctx.drawImage(img, 0, 0, w, h)

      // JPEG is universally supported by toDataURL on all platforms
      // WebP toDataURL is NOT supported on iOS Safari — skipping it
      let quality = 0.85
      const mime = 'image/jpeg'

      try {
        while (quality >= 0.1) {
          const dataUrl = canvas.toDataURL(mime, quality)
          const b64 = dataUrl.split(',')[1]
          const bytes = Math.round((b64.length * 3) / 4)

          if (bytes <= 300 * 1024) {
            clearTimeout(timeout); done = true
            resolve({ data: b64, type: mime })
            return
          }
          quality -= 0.15
        }

        // Accept whatever we got at lowest quality
        const dataUrl = canvas.toDataURL(mime, 0.1)
        const b64 = dataUrl.split(',')[1]
        clearTimeout(timeout); done = true
        resolve({ data: b64, type: mime })
      } catch {
        clearTimeout(timeout); done = true
        reject(new Error('Compression failed'))
      }
    }

    img.onerror = () => { clearTimeout(timeout); done = true; reject(new Error('Image load failed')) }
    img.src = url
  })
}
