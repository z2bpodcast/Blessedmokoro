import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// FILE: app/api/progress/route.ts
// Records session completions + awards badges + updates leaderboard
// Called when a builder completes a session in the workshop

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Badge milestones
const BADGE_MILESTONES: Record<number, { id: string; name: string }> = {
  1:  { id: 'first_fire',   name: 'First Fire Starter' },
  18: { id: 'scholar',      name: 'Scholar' },
  50: { id: 'deep_reader',  name: 'Deep Reader' },
  99: { id: 'century',      name: 'Century Builder' },
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  try {
    const { user_id, session_number, tier, name } = await req.json()
    if (!user_id || !session_number) {
      return NextResponse.json({ error: 'user_id and session_number required' }, { status: 400 })
    }

    // 1. Upsert progress record
    const { error: progressError } = await supabase
      .from('workshop_progress')
      .upsert({
        user_id,
        session_number,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,session_number' })

    if (progressError) throw progressError

    // 2. Count total completed sessions
    const { count } = await supabase
      .from('workshop_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)

    const totalSessions = count || 0

    // 3. Award badges at milestones
    const milestone = BADGE_MILESTONES[totalSessions]
    if (milestone) {
      await supabase.from('builder_badges').upsert({
        user_id,
        badge_id:   milestone.id,
        badge_name: milestone.name,
        awarded_at: new Date().toISOString(),
      }, { onConflict: 'user_id,badge_id' })
    }

    // 4. Update leaderboard
    const week = new Date()
    week.setDate(week.getDate() - week.getDay()) // Start of week Sunday
    const weekOf = week.toISOString().split('T')[0]

    await supabase.from('leaderboard_weekly').upsert({
      user_id,
      name:  name || 'Builder',
      tier:  tier || 'fam',
      week_of: weekOf,
      sessions_this_week: 1,
      invites_this_week:  0,
      torch_days:         0,
    }, { onConflict: 'user_id,week_of' })

    // Increment sessions count
    await supabase.rpc('update_leaderboard', {
      p_user_id:   user_id,
      p_name:      name || 'Builder',
      p_tier:      tier || 'fam',
      p_field:     'sessions',
      p_increment: 1,
    })

    return NextResponse.json({
      success:       true,
      totalSessions,
      badgeAwarded:  milestone || null,
    })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const supabase = getSupabase()
  try {
    const user_id = req.nextUrl.searchParams.get('user_id')
    if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

    const { data, count } = await supabase
      .from('workshop_progress')
      .select('session_number, completed_at', { count: 'exact' })
      .eq('user_id', user_id)
      .order('session_number')

    return NextResponse.json({ completed: data || [], total: count || 0 })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
