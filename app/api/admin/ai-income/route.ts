// FILE: app/api/admin/ai-income/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    )
    const [{ data: unlocks }, { data: commissions }] = await Promise.all([
      supabase.from('ai_income_unlocks')
        .select('*, profiles(full_name, email)')
        .order('unlocked_at', { ascending: false }),
      supabase.from('ai_income_commissions')
        .select('*, referrer:profiles!ai_income_commissions_referrer_id_fkey(full_name, email), referred:profiles!ai_income_commissions_referred_id_fkey(full_name)')
        .order('created_at', { ascending: false }),
    ])
    return NextResponse.json({ unlocks: unlocks||[], commissions: commissions||[] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    )
    const { action, commission_id } = await req.json()
    if (action === 'mark_paid') {
      await supabase.from('ai_income_commissions')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', commission_id)
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
