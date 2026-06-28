export async function compressBase64(base64: string, fileType: string, timeoutMs = 30000): Promise<{ data: string; type: string }> {
  const compress = async (): Promise<{ data: string; type: string }> => {
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

        let quality = 0.85
        const tryFormat = (fmt: string) => {
          canvas.toBlob((blob) => {
            if (done) return
            if (!blob) {
              if (fmt === 'image/webp') return tryFormat('image/jpeg')
              finish(); reject(new Error('Compression failed'))
              return
            }

            if (blob.size <= 300 * 1024 || quality <= 0.1) {
              const reader = new FileReader()
              reader.onload = () => {
                finish()
                resolve({ data: (reader.result as string).split(',')[1], type: fmt })
              }
              reader.readAsDataURL(blob)
              return
            }

            quality -= 0.15
            tryFormat(fmt)
          }, fmt, quality)
        }

        tryFormat('image/webp')
      }

      img.onerror = () => { finish(); reject(new Error('Image load failed')) }
      img.src = url
    })
  }

  return Promise.race([
    compress(),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeoutMs)),
  ])
}
