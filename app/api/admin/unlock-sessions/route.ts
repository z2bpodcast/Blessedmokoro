// FILE: app/api/admin/unlock-sessions/route.ts
// Unlocks workshop sessions for a specific user — service role bypasses RLS

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    )

    const { user_id, sessions } = await req.json()
    if (!user_id || !sessions?.length) {
      return NextResponse.json({ error: 'Missing user_id or sessions' }, { status: 400 })
    }

    // Upsert each session as completed
    const rows = sessions.map((section_id: number) => ({
      user_id,
      section_id,
      read:          true,
      activity_done: true,
      completed:     true,
      score:         null,
      completed_at:  new Date().toISOString(),
      updated_at:    new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('workshop_progress')
      .upsert(rows, { onConflict: 'user_id,section_id' })

    if (error) {
      console.error('Unlock error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ Admin unlocked ${sessions.length} sessions for ${user_id}`)
    return NextResponse.json({ ok: true, unlocked: sessions.length })

  } catch (e: any) {
    console.error('Unlock route error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
