import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const CDN_UPLOAD_URL = 'https://cdn.jyavani.com/upload.php'
const UPLOAD_SECRET = process.env.UPLOAD_SECRET || ''

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!UPLOAD_SECRET) {
    return NextResponse.json({ error: 'Upload secret not configured' }, { status: 500 })
  }

  // Check admin role for higher limit
  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const MAX_BYTES = isAdmin ? 50 * 1024 * 1024 : 2 * 1024 * 1024

  let body: { files?: { name: string; type: string; data: string }[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const files = body?.files
  if (!files || !Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  if (files.length > 10) {
    return NextResponse.json({ error: 'Max 10 files per request' }, { status: 400 })
  }

  const incomingSize = files.reduce((sum, f) => {
    try { return sum + Math.round((f.data.length * 3) / 4) } catch { return sum }
  }, 0)
  
  for (const f of files) {
    const bytes = Math.round((f.data.length * 3) / 4)
    if (bytes > 5 * 1024 * 1024) {
      return NextResponse.json({ error: `File too large (max 5MB)` }, { status: 413 })
    }
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: usageData } = await supabase
    .from('upload_logs')
    .select('file_size_bytes')
    .eq('user_id', user.id)
    .gte('created_at', since)

  const totalUsed = (usageData || []).reduce((sum, r) => sum + r.file_size_bytes, 0)

  if (totalUsed + incomingSize > MAX_BYTES) {
    return NextResponse.json({
      error: `Upload limit exceeded (${MAX_BYTES / 1024 / 1024}MB/24h)`,
      used: totalUsed,
      limit: MAX_BYTES,
    }, { status: 429 })
  }

  const results: { url: string }[] = []

  for (const file of files) {
    const buffer = Buffer.from(file.data, 'base64')
    const blob = new Blob([buffer], { type: file.type || 'image/webp' })

    const cdnForm = new FormData()
    cdnForm.append('file', blob, file.name || 'photo.webp')
    cdnForm.append('category', 'fitness')
    cdnForm.append('user_id', user.id)

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

    await supabase.from('upload_logs').insert({
      user_id: user.id,
      file_size_bytes: incomingSize,
    })
  }

  if (results.length === 0) {
    return NextResponse.json({ error: 'All uploads failed' }, { status: 502 })
  }

  return NextResponse.json({ urls: results.map(r => r.url) })
}
