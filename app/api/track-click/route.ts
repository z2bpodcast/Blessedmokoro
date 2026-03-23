import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// FILE: app/api/track-click/route.ts
// Records referral link clicks in Supabase
// Called when anyone opens a referral link

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const supabase = getSupabase()
  const ref      = req.nextUrl.searchParams.get('ref')
  const redirect = req.nextUrl.searchParams.get('to') || '/workshop'

  if (!ref) {
    return NextResponse.redirect(new URL(redirect, req.url))
  }

  try {
    // Call the Supabase function to record click + update torch log
    await supabase.rpc('record_invite_click', { p_ref_code: ref })

    // Also update invitation_dispatches directly for any recent dispatch
    await supabase
      .from('invitation_dispatches')
      .update({ link_clicked: true, clicked_at: new Date().toISOString() })
      .eq('ref_code', ref)
      .eq('link_clicked', false)
      .order('dispatched_at', { ascending: false })
      .limit(1)

  } catch(e) {
    console.error('Track click error:', e)
  }

  // Always redirect — never block the user
  const redirectUrl = new URL(`${redirect}?ref=${ref}`, req.url)
  return NextResponse.redirect(redirectUrl)
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  try {
    const { ref_code } = await req.json()
    if (!ref_code) return NextResponse.json({ error: 'ref_code required' }, { status: 400 })
    await supabase.rpc('record_invite_click', { p_ref_code: ref_code })
    return NextResponse.json({ success: true })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
