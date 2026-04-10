// FILE: app/api/sponsor/route.ts
// Public endpoint — returns builder name from referral code
// Used by invite page to show "Invited by [Name]" without requiring auth
// RLS safe — uses service role key server-side only

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const ref = req.nextUrl.searchParams.get('ref')

    if (!ref || ref.length < 3) {
      return NextResponse.json({ error: 'Invalid ref' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('referral_code', ref.toUpperCase())
      .single()

    if (error || !data) {
      return NextResponse.json({ name: null }, { status: 200 })
    }

    // Only return first name + last initial for privacy e.g. "John D."
    const parts = (data.full_name || '').trim().split(' ')
    const display = parts.length > 1
      ? `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`
      : parts[0] || null

    return NextResponse.json({ name: display }, { status: 200 })

  } catch (e: any) {
    console.error('Sponsor route error:', e)
    return NextResponse.json({ name: null }, { status: 200 }) // fail silently
  }
}
