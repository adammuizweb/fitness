import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const CDN_UPLOAD_URL = 'https://cdn.jyavani.com/upload.php'
const UPLOAD_SECRET = process.env.UPLOAD_SECRET || ''
const MAX_BYTES_PER_24H = 2 * 1024 * 1024

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!UPLOAD_SECRET) {
    return NextResponse.json({ error: 'Upload secret not configured' }, { status: 500 })
  }

  const formData = await request.formData()
  const files = formData.getAll('file') as File[]
  
  if (files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  if (files.length > 10) {
    return NextResponse.json({ error: 'Max 10 files per request' }, { status: 400 })
  }

  for (const file of files) {
    if (file.size > 300 * 1024) {
      return NextResponse.json({ error: 'Each file must be under 300KB' }, { status: 413 })
    }
  }

  // Rate limit check: sum upload_logs in last 24h
  const supabase = createAdminClient()
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: usageData } = await supabase
    .from('upload_logs')
    .select('file_size_bytes')
    .eq('user_id', user.id)
    .gte('created_at', since)

  const totalUsed = (usageData || []).reduce((sum, r) => sum + r.file_size_bytes, 0)
  const incomingSize = files.reduce((sum, f) => sum + f.size, 0)

  if (totalUsed + incomingSize > MAX_BYTES_PER_24H) {
    return NextResponse.json({
      error: 'Upload limit exceeded (2MB/24h)',
      used: totalUsed,
      limit: MAX_BYTES_PER_24H,
    }, { status: 429 })
  }

  const results: { url: string; filename: string }[] = []

  try {
    for (const file of files) {
      const cdnForm = new FormData()
      cdnForm.append('file', file, 'photo.webp')
      cdnForm.append('category', 'fitness')

      const res = await fetch(CDN_UPLOAD_URL, {
        method: 'POST',
        headers: { 'X-UPLOAD-TOKEN': UPLOAD_SECRET },
        body: cdnForm,
      })

      if (!res.ok) {
        const err = await res.text()
        console.error('CDN upload failed:', res.status, err)
        continue
      }

      const data = await res.json()
      results.push(data)

      // Log upload for rate limiting
      await supabase.from('upload_logs').insert({
        user_id: user.id,
        file_size_bytes: file.size,
      })
    }

    if (results.length === 0) {
      return NextResponse.json({ error: 'All uploads failed' }, { status: 502 })
    }

    return NextResponse.json({ urls: results.map(r => r.url) })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
