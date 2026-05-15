// ============================================================
// Z2B V3 — SAVE IDEAS FEATURE
// File: app/api/saved-ideas/route.ts
// Allows members to save opportunities from Idea Ignition
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

// GET — fetch saved ideas for this member
export async function GET(req: NextRequest) {
  const { user, sb } = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data, error } = await (sb.from as any)('saved_ideas')
    .select('*')
    .eq('member_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50) as { data: any[] | null; error: any }

  if (error) {
    console.error('[saved-ideas GET]', error)
    return NextResponse.json({ ideas: [] })
  }

  return NextResponse.json({ ideas: data ?? [] })
}

// POST — save or unsave an idea
export async function POST(req: NextRequest) {
  const { user, sb } = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body   = await req.json()
  const action = body.action as string  // 'save' | 'unsave'

  if (!['save', 'unsave'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  if (action === 'unsave') {
    const { error } = await (sb.from as any)('saved_ideas')
      .delete()
      .eq('member_id', user.id)
      .eq('idea_id', body.ideaId)

    if (error) return NextResponse.json({ error: 'Could not remove idea.' }, { status: 500 })
    return NextResponse.json({ success: true, saved: false })
  }

  // Save
  const { idea } = body as { idea: {
    id:              string
    title:           string
    category:        string
    targetAudience:  string
    problemSolved:   string
    priceRange:      string
    format:          string
    difficulty?:     string
  }}

  if (!idea?.id || !idea?.title) {
    return NextResponse.json({ error: 'Missing idea data.' }, { status: 400 })
  }

  // Check max 20 saved ideas
  const { count } = await (sb.from as any)('saved_ideas')
    .select('*', { count: 'exact', head: true })
    .eq('member_id', user.id) as { count: number | null }

  if ((count ?? 0) >= 20) {
    return NextResponse.json(
      { error: 'You have 20 saved ideas. Remove one before saving another.' },
      { status: 429 }
    )
  }

  // Check if already saved
  const { data: existing } = await (sb.from as any)('saved_ideas')
    .select('id')
    .eq('member_id', user.id)
    .eq('idea_id', idea.id)
    .maybeSingle() as { data: any }

  if (existing) {
    return NextResponse.json({ success: true, saved: true, alreadySaved: true })
  }

  const { error } = await (sb.from as any)('saved_ideas').insert({
    member_id:       user.id,
    idea_id:         idea.id,
    title:           idea.title,
    category:        idea.category,
    target_audience: idea.targetAudience,
    problem_solved:  idea.problemSolved,
    price_range:     idea.priceRange,
    format:          idea.format,
    difficulty:      idea.difficulty ?? null,
  })

  if (error) {
    console.error('[saved-ideas POST]', error)
    return NextResponse.json({ error: 'Could not save idea.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, saved: true })
}
