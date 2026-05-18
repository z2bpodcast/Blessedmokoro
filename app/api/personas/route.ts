// ============================================================
// Z2B — PERSONAS API
// File: app/api/personas/route.ts
// Save / load / delete builder personas (max 3 per builder)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'

async function getUser(req: NextRequest) {
  const sb    = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return { user: null, sb }
  const { data: { user } } = await sb.auth.getUser(token)
  return { user, sb }
}

// GET — load all saved personas for builder
export async function GET(req: NextRequest) {
  const { user, sb } = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data } = await (sb.from as any)('builder_personas')
    .select('*')
    .eq('builder_id', user.id)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  return NextResponse.json({ personas: data ?? [] })
}

// POST — save / delete persona
export async function POST(req: NextRequest) {
  const { user, sb } = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { action, persona, personaId } = await req.json()

  if (action === 'save') {
    // Check limit — max 3
    const { count } = await (sb.from as any)('builder_personas')
      .select('id', { count: 'exact', head: true })
      .eq('builder_id', user.id) as { count: number | null }

    if ((count ?? 0) >= 3) {
      return NextResponse.json({
        error: 'You have reached the maximum of 3 saved personas. Please delete one before saving a new one.',
        limitReached: true,
      }, { status: 403 })
    }

    const { data, error } = await (sb.from as any)('builder_personas').insert({
      builder_id:   user.id,
      persona_name: persona.personaName ?? 'My Persona',
      persona_data: persona,
      summary:      persona.personaSummary ?? '',
      created_at:   new Date().toISOString(),
    }).select().single() as { data: any; error: any }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, persona: data })
  }

  if (action === 'delete') {
    if (!personaId) return NextResponse.json({ error: 'Persona ID required' }, { status: 400 })
    await (sb.from as any)('builder_personas').delete().eq('id', personaId).eq('builder_id', user.id)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
