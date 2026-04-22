// FILE: app/api/admin/ai-income/route.ts
import { NextRequest, NextResponse } from 'next/server'
import {
  minVehicle,
  parseVehicleScope,
  tierVehicleCap,
  type FourmVehicle,
} from '@/lib/fourm-access'

async function reconcileFourmRow(
  supabase: any,
  user_id: string,
  paidTier: string,
  existing: {
    four_m_unlock_source?: string | null
    four_m_vehicle_scope?: string | null
    referred_by?: string | null
    amount_paid?: number | null
  } | null
) {
  const tierCap = tierVehicleCap(paidTier)

  if (paidTier === 'fam') {
    if (!existing) return { ok: true as const, mode: 'preview' as const }

    const src = String(existing.four_m_unlock_source || '')

    if (src === 'payment_ai_income') {
      const { error } = await supabase.from('ai_income_unlocks').upsert(
        {
          user_id,
          referred_by: existing.referred_by ?? null,
          amount_paid: existing.amount_paid ?? 0,
          four_m_vehicle_scope: 'manual',
          four_m_unlock_source: 'payment_ai_income',
        },
        { onConflict: 'user_id' }
      )
      if (error) throw new Error(error.message)
      return { ok: true as const, paidTier, tierCap: 'manual' as const, effective: 'manual' as const }
    }

    if (src === 'admin_manual') {
      const adminScope = parseVehicleScope(existing.four_m_vehicle_scope) || 'manual'
      const effective = minVehicle('manual', adminScope)
      const { error } = await supabase.from('ai_income_unlocks').upsert(
        {
          user_id,
          referred_by: existing.referred_by ?? null,
          amount_paid: existing.amount_paid ?? 0,
          four_m_vehicle_scope: effective,
          four_m_unlock_source: 'admin_manual',
        },
        { onConflict: 'user_id' }
      )
      if (error) throw new Error(error.message)
      return { ok: true as const, paidTier, tierCap: 'manual' as const, effective, adminScope }
    }

    // Unknown/legacy row on fam — normalize to preview (do not grant paid vehicles accidentally)
    const { error } = await supabase.from('ai_income_unlocks').delete().eq('user_id', user_id)
    if (error) throw new Error(error.message)
    return { ok: true as const, mode: 'preview' as const }
  }

  const isAdminManual = String(existing?.four_m_unlock_source || '') === 'admin_manual'
  const adminScope = isAdminManual ? (parseVehicleScope(existing?.four_m_vehicle_scope) || 'manual') : null
  const effective = adminScope ? minVehicle(tierCap, adminScope) : tierCap

  const { error } = await supabase.from('ai_income_unlocks').upsert(
    {
      user_id,
      referred_by: existing?.referred_by ?? null,
      amount_paid: existing?.amount_paid ?? 0,
      four_m_vehicle_scope: effective,
      four_m_unlock_source: isAdminManual ? 'admin_manual' : 'membership_tier',
    },
    { onConflict: 'user_id' }
  )
  if (error) throw new Error(error.message)
  return { ok: true as const, paidTier, tierCap, effective, adminScope }
}

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
    const { action, commission_id, user_id, referred_by, amount_paid, four_m_vehicle_scope } = await req.json()
    if (action === 'mark_paid') {
      await supabase.from('ai_income_commissions')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', commission_id)
      return NextResponse.json({ ok: true })
    }
    if (action === 'unlock_user') {
      if (!user_id) {
        return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
      }
      const requested = parseVehicleScope(four_m_vehicle_scope) || ((four_m_vehicle_scope as FourmVehicle) || 'manual')

      const [{ data: profile, error: pErr }, { data: existing }] = await Promise.all([
        supabase.from('profiles').select('paid_tier').eq('id', user_id).single(),
        supabase
          .from('ai_income_unlocks')
          .select('referred_by, amount_paid, four_m_unlock_source, four_m_vehicle_scope')
          .eq('user_id', user_id)
          .maybeSingle(),
      ])
      if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })

      const paidTier = String(profile?.paid_tier || 'fam')
      const tierCap = tierVehicleCap(paidTier)
      const desired = paidTier === 'fam' ? minVehicle('manual', requested) : minVehicle(tierCap, requested)

      const { error } = await supabase.from('ai_income_unlocks').upsert(
        {
          user_id,
          referred_by: referred_by ?? existing?.referred_by ?? null,
          amount_paid: existing?.amount_paid ?? amount_paid ?? 0,
          four_m_vehicle_scope: desired,
          four_m_unlock_source: 'admin_manual',
        },
        { onConflict: 'user_id' }
      )
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      try {
        const out = await reconcileFourmRow(supabase, user_id, paidTier, {
          four_m_unlock_source: 'admin_manual',
          four_m_vehicle_scope: desired,
          referred_by: referred_by ?? existing?.referred_by ?? null,
          amount_paid: existing?.amount_paid ?? amount_paid ?? 0,
        })
        return NextResponse.json({ ...out, requested, desired })
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
      }
    }
    if (action === 'lock_four_m') {
      if (!user_id) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

      const [{ data: profile, error: pErr }, { data: row }] = await Promise.all([
        supabase.from('profiles').select('paid_tier').eq('id', user_id).single(),
        supabase
          .from('ai_income_unlocks')
          .select('four_m_unlock_source, four_m_vehicle_scope, referred_by, amount_paid')
          .eq('user_id', user_id)
          .maybeSingle(),
      ])
      if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })

      const paidTier = String(profile?.paid_tier || 'fam')
      const src = String(row?.four_m_unlock_source || '')

      try {
        if (!row) {
          return NextResponse.json({ ok: true, note: 'no_unlock_row' })
        }

        // "Lock" means: remove CEO manual override. It must NOT delete paid membership entitlements.
        if (src !== 'admin_manual') {
          const out = await reconcileFourmRow(supabase, user_id, paidTier, row)
          return NextResponse.json({ ...out, note: 'no_admin_override' })
        }

        if (paidTier === 'fam') {
          const paidStarter = (row.amount_paid || 0) > 0
          const out = await reconcileFourmRow(
            supabase,
            user_id,
            paidTier,
            paidStarter
              ? {
                  four_m_unlock_source: 'payment_ai_income',
                  four_m_vehicle_scope: 'manual',
                  referred_by: row.referred_by ?? null,
                  amount_paid: row.amount_paid ?? 0,
                }
              : null
          )
          return NextResponse.json(out)
        }

        const out = await reconcileFourmRow(supabase, user_id, paidTier, {
          four_m_unlock_source: 'membership_tier',
          four_m_vehicle_scope: tierVehicleCap(paidTier),
          referred_by: row.referred_by ?? null,
          amount_paid: row.amount_paid ?? 0,
        })
        return NextResponse.json(out)
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
      }
    }

    if (action === 'sync_four_m_access') {
      if (!user_id) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('paid_tier')
        .eq('id', user_id)
        .single()
      if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })

      const paidTier = String(profile?.paid_tier || 'fam')

      const { data: row } = await supabase
        .from('ai_income_unlocks')
        .select('four_m_unlock_source, four_m_vehicle_scope, referred_by, amount_paid')
        .eq('user_id', user_id)
        .maybeSingle()

      try {
        const out = await reconcileFourmRow(supabase, user_id, paidTier, row)
        return NextResponse.json(out)
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
      }
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
