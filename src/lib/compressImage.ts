export async function compressImage(file: File, maxSizeKB = 300): Promise<Blob> {
  if (file.size <= maxSizeKB * 1024) return file

  // Read file as ArrayBuffer
  const inputBuf = await file.arrayBuffer()
  const inputBytes = new Uint8Array(inputBuf)

  // Simple JPEG compression by stripping EXIF and re-encoding via canvas
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(new Blob([inputBuf], { type: file.type }))
    let done = false

    img.onload = () => {
      if (done) return; done = true
      URL.revokeObjectURL(url)

      let w = img.width, h = img.height
      const maxDim = 1200
      if (w > maxDim || h > maxDim) {
        const r = Math.min(maxDim / w, maxDim / h)
        w = Math.round(w * r)
        h = Math.round(h * r)
      }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error('Canvas error')); return }

      ctx.drawImage(img, 0, 0, w, h)

      // Try WebP, fall back to JPEG
      let quality = 0.8
      const tryFormat = (fmt: string) => {
        canvas.toBlob((blob) => {
          if (blob && blob.size <= maxSizeKB * 1024) { resolve(blob); return }
          if (quality > 0.2) { quality -= 0.15; tryFormat(fmt); return }
          if (fmt === 'image/webp') { quality = 0.8; tryFormat('image/jpeg'); return }
          // Accept whatever we get
          canvas.toBlob((b) => { if (b) resolve(b); else reject(new Error('Compression failed')) }, 'image/jpeg', 0.5)
        }, fmt, quality)
      }
      tryFormat('image/webp')
    }

    img.onerror = () => { if (!done) { done = true; URL.revokeObjectURL(url); reject(new Error('Image load failed')) } }
    img.src = url

    // Timeout after 10s
    setTimeout(() => { if (!done) { done = true; URL.revokeObjectURL(url); reject(new Error('Timeout')) } }, 10000)
  })
}
