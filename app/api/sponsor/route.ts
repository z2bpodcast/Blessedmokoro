// FILE: app/api/sponsor/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { createClient } = await import('@supabase/supabase-js')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    )

    const ref = req.nextUrl.searchParams.get('ref')
    if (!ref || ref.length < 3) {
      return NextResponse.json({ name: null })
    }

    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('referral_code', ref.toUpperCase())
      .single()

    if (!data?.full_name) {
      return NextResponse.json({ name: null })
    }

    const parts = data.full_name.trim().split(' ')
    const display = parts.length > 1
      ? `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`
      : parts[0]

    return NextResponse.json({ name: display })

  } catch {
    return NextResponse.json({ name: null })
  }
}
