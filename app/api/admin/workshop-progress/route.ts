// FILE: app/api/admin/workshop-progress/route.ts
// Returns all members + their workshop progress using service role (bypasses RLS)

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    )

    // Fetch all profiles
    const { data: profiles, error: profErr } = await supabase
      .from('profiles')
      .select('id, full_name, email, whatsapp_number, paid_tier, referral_code, is_paid_member')
      .order('full_name')
      .limit(1000)

    if (profErr) {
      console.error('Profiles error:', profErr.message)
      return NextResponse.json({ error: profErr.message }, { status: 500 })
    }

    // Fetch all completed progress
    const { data: progress, error: progErr } = await supabase
      .from('workshop_progress')
      .select('user_id, section_id')
      .eq('completed', true)
      .not('user_id', 'is', null)
      .limit(5000)

    if (progErr) {
      console.error('Progress error:', progErr.message)
      return NextResponse.json({ error: progErr.message }, { status: 500 })
    }

    // Group progress by user_id
    const progressByUser: Record<string, number[]> = {}
    ;(progress || []).forEach(r => {
      if (!r.user_id || !r.section_id) return
      if (!progressByUser[r.user_id]) progressByUser[r.user_id] = []
      progressByUser[r.user_id].push(r.section_id)
    })

    // Merge
    const merged = (profiles || []).map(p => {
      const sessions = progressByUser[p.id] || []
      const maxSession = sessions.length > 0 ? Math.max(...sessions) : null
      return {
        ...p,
        sessions_completed: sessions.length,
        last_session:       maxSession,
        is_harvest_ready:   sessions.length >= 9,
      }
    })

    merged.sort((a, b) => b.sessions_completed - a.sessions_completed)

    return NextResponse.json({ members: merged })

  } catch (e: any) {
    console.error('Admin workshop progress error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
