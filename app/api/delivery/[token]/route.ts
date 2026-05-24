import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const { data: rec } = await (sb().from as any)('product_delivery_tokens')
    .select('*').eq('token', token).maybeSingle()

  if (!rec) return NextResponse.json({ error: 'Invalid link', status: 'error' }, { status: 404 })

  if (new Date(rec.expires_at) < new Date())
    return NextResponse.json({ error: 'Link expired', status: 'expired' }, { status: 410 })

  if (rec.download_count >= rec.max_downloads)
    return NextResponse.json({ error: 'Download limit reached', status: 'exhausted' }, { status: 410 })

  return NextResponse.json({
    product_title:       rec.product_title,
    buyer_name:          rec.buyer_name,
    expires_at:          rec.expires_at,
    downloads_remaining: rec.max_downloads - rec.download_count,
    session_id:          rec.session_id,
  })
}