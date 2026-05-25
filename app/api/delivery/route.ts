import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const { data: { user } } = await sb().auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { sessionId, buyerEmail, buyerName, productTitle } = await req.json()
  if (!sessionId) return NextResponse.json({ error: 'Session ID required' }, { status: 400 })

  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await (sb().from as any)('product_delivery_tokens').insert({
    session_id:    sessionId,
    builder_id:    user.id,
    buyer_email:   buyerEmail ?? '',
    buyer_name:    buyerName  ?? '',
    product_title: productTitle ?? '',
    max_downloads: 2,
    expires_at:    expires,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.z2blegacybuilders.co.za"
  const link = `${baseUrl}/download/${data.token}`
  return NextResponse.json({ token: data.token, link, expires })
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const { data: { user } } = await sb().auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data } = await (sb().from as any)('product_delivery_tokens')
    .select('*')
    .eq('builder_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json({ tokens: data ?? [] })
}