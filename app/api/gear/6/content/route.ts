// ============================================================
// Z2B — GEAR 6 CONTENT PERSISTENCE API (SPRINT 22)
// File: app/api/gear/6/content/route.ts
// Save and retrieve all Gear 6 generated content permanently
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'

async function getUser(req: NextRequest) {
  const sb    = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return { user: null, sb }
  const { data: { user } } = await sb.auth.getUser(token)
  return { user, sb }
}

// GET — retrieve saved Gear 6 content for a session
export async function GET(req: NextRequest) {
  const { user, sb } = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) return NextResponse.json({ error: 'Session ID required' }, { status: 400 })

  const { data } = await (sb.from as any)('gear6_content')
    .select('*')
    .eq('session_id', sessionId)
    .eq('builder_id', user.id)
    .maybeSingle()

  return NextResponse.json({ content: data ?? null })
}

// POST — save Gear 6 content
export async function POST(req: NextRequest) {
  const { user, sb } = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { action, sessionId, content } = await req.json()

  if (action === 'save') {
    if (!sessionId || !content) {
      return NextResponse.json({ error: 'Session ID and content required' }, { status: 400 })
    }

    // Upsert — save or update
    const { data, error } = await (sb.from as any)('gear6_content').upsert({
      session_id:      sessionId,
      builder_id:      user.id,
      listing_title:   content.listingTitle ?? '',
      listing_body:    content.listingBody ?? '',
      price:           content.price ?? 299,
      currency:        content.currency ?? 'R',
      social_posts:    content.socialPosts ?? {},
      platform_kits:   content.platformKits ?? {},
      keywords:        content.keywords ?? [],
      author_name:     content.authorName ?? '',
      author_type:     content.authorType ?? 'none',
      cover_style:     content.coverStyle ?? 'professional',
      updated_at:      new Date().toISOString(),
    }, { onConflict: 'session_id' }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, content: data })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
