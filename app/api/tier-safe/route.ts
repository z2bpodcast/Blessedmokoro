// FILE: app/api/tier-safe/route.ts
// 💰 Tier Upgrade Safe — Builder savings toward next tier upgrade

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

const TIER_PRICES: Record<string,number> = {
  starter:500, bronze:2500, copper:5000, silver:12000, gold:24000, platinum:50000,
  silver_rocket:17000, gold_rocket:35000, platinum_rocket:70000,
}

const NEXT_TIER: Record<string,{name:string,price:number}> = {
  starter:       { name:'Bronze',            price:2500  },
  bronze:        { name:'Copper',            price:5000  },
  copper:        { name:'Silver',            price:12000 },
  silver:        { name:'Silver Rocket',     price:17000 },
  silver_rocket: { name:'Gold',              price:24000 },
  gold:          { name:'Gold Rocket',       price:35000 },
  gold_rocket:   { name:'Platinum',          price:50000 },
  platinum:      { name:'Platinum Rocket',   price:70000 },
}

export async function GET(req: NextRequest) {
  const url    = new URL(req.url)
  const userId = url.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  // Get safe status
  const { data: safe } = await supabase
    .from('tier_upgrade_safe')
    .select('*')
    .eq('builder_id', userId)
    .eq('status', 'active')
    .single()

  // Get profile for current tier
  const { data: prof } = await supabase
    .from('profiles')
    .select('paid_tier')
    .eq('id', userId)
    .single()

  const currentTier = prof?.paid_tier || 'free'
  const nextTier    = NEXT_TIER[currentTier]

  // Get recent safe transactions
  const { data: transactions } = await supabase
    .from('safe_transactions')
    .select('*')
    .eq('builder_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({
    safe,
    currentTier,
    nextTier,
    transactions: transactions || [],
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, userId } = body

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    // ── Activate safe ──────────────────────────────────────────────────────
    if (action === 'activate') {
      const { savePercent } = body
      if (!savePercent || savePercent < 1 || savePercent > 90) {
        return NextResponse.json({ error: 'Save percent must be 1-90%' }, { status: 400 })
      }

      const { data: prof } = await supabase.from('profiles').select('paid_tier').eq('id', userId).single()
      const currentTier = prof?.paid_tier || 'starter'

      if (currentTier === 'free') {
        return NextResponse.json({ error: 'Free builders cannot use Tier Safe. Upgrade to Starter first.' }, { status: 403 })
      }

      const nextTier = NEXT_TIER[currentTier]
      if (!nextTier || nextTier.price === 0) {
        return NextResponse.json({ error: 'You are already at the highest tier.' }, { status: 400 })
      }

      // Cancel any existing safe first
      await supabase.from('tier_upgrade_safe')
        .update({ status:'cancelled' })
        .eq('builder_id', userId)
        .eq('status', 'active')

      // Create new safe
      const { data: safe } = await supabase.from('tier_upgrade_safe').insert({
        builder_id:    userId,
        current_tier:  currentTier,
        target_tier:   nextTier.name.toLowerCase().replace(' ', '_'),
        target_price:  nextTier.price,
        save_percent:  savePercent,
        saved_amount:  0,
      }).select().single()

      return NextResponse.json({
        ok: true,
        safe,
        message: `Safe activated! ${savePercent}% of your earnings will be saved toward ${nextTier.name} (R${nextTier.price.toLocaleString()}).`,
      })
    }

    // ── Update save percentage ─────────────────────────────────────────────
    if (action === 'update_percent') {
      const { savePercent } = body
      await supabase.from('tier_upgrade_safe')
        .update({ save_percent: savePercent })
        .eq('builder_id', userId)
        .eq('status', 'active')
      return NextResponse.json({ ok: true, message: `Save percentage updated to ${savePercent}%` })
    }

    // ── Top up balance manually ────────────────────────────────────────────
    if (action === 'top_up') {
      const { amount } = body
      if (!amount || amount < 1) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

      const { data: safe } = await supabase.from('tier_upgrade_safe')
        .select('*').eq('builder_id', userId).eq('status', 'active').single()

      if (!safe) return NextResponse.json({ error: 'No active Safe found' }, { status: 404 })

      const newBalance = safe.saved_amount + amount
      const upgradeReady = newBalance >= safe.target_price

      await supabase.from('tier_upgrade_safe').update({
        saved_amount: newBalance,
        status: upgradeReady ? 'completed' : 'active',
      }).eq('id', safe.id)

      await supabase.from('safe_transactions').insert({
        builder_id: userId, safe_id: safe.id,
        type: 'top_up', amount,
        notes: `Manual top-up of R${amount}`,
      })

      return NextResponse.json({
        ok: true,
        newBalance,
        upgradeReady,
        message: upgradeReady
          ? `🎉 Target reached! Your Safe has R${newBalance.toLocaleString()} — ready to upgrade to ${safe.target_tier}!`
          : `Top-up successful. Balance: R${newBalance.toLocaleString()} / R${safe.target_price.toLocaleString()}`,
      })
    }

    // ── Cancel and refund ──────────────────────────────────────────────────
    if (action === 'cancel') {
      const { data: safe } = await supabase.from('tier_upgrade_safe')
        .select('*').eq('builder_id', userId).eq('status', 'active').single()

      if (!safe) return NextResponse.json({ error: 'No active Safe found' }, { status: 404 })

      const refundAmount = safe.saved_amount

      await supabase.from('tier_upgrade_safe').update({ status:'cancelled' }).eq('id', safe.id)
      await supabase.from('safe_transactions').insert({
        builder_id: userId, safe_id: safe.id,
        type: 'refund', amount: refundAmount,
        notes: 'Builder cancelled Safe — full refund issued. Tier unchanged.',
      })

      return NextResponse.json({
        ok: true,
        refundAmount,
        message: `Safe cancelled. R${refundAmount.toLocaleString()} refund is being processed. Your tier remains unchanged.`,
      })
    }

    // ── Apply upgrade when ready ───────────────────────────────────────────
    if (action === 'apply_upgrade') {
      const { data: safe } = await supabase.from('tier_upgrade_safe')
        .select('*').eq('builder_id', userId).eq('status', 'completed').single()

      if (!safe) return NextResponse.json({ error: 'No completed Safe found' }, { status: 404 })

      // Update profile to new tier
      await supabase.from('profiles').update({ paid_tier: safe.target_tier }).eq('id', userId)

      // Mark safe as used
      await supabase.from('tier_upgrade_safe').update({ status:'used' }).eq('id', safe.id)

      await supabase.from('safe_transactions').insert({
        builder_id: userId, safe_id: safe.id,
        type: 'upgrade_payment', amount: safe.saved_amount,
        notes: `Tier upgraded from ${safe.current_tier} to ${safe.target_tier}`,
      })

      return NextResponse.json({
        ok: true,
        newTier: safe.target_tier,
        message: `🚀 Congratulations! You have been upgraded to ${safe.target_tier}!`,
      })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  } catch (e: any) {
    console.error('[TierSafe] ERROR:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
