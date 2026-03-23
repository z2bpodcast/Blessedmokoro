// v2026-03-23 14:24 — signature verification
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// FILE: app/api/yoco/route.ts
// Yoco payment webhook + checkout creation
// Signature verified using YOCO_WEBHOOK_SECRET

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const YOCO_SECRET_KEY     = process.env.YOCO_SECRET_KEY || ''
const YOCO_WEBHOOK_SECRET = process.env.YOCO_WEBHOOK_SECRET || ''
const APP_URL             = process.env.NEXT_PUBLIC_APP_URL || 'https://app.z2blegacybuilders.co.za'

const AMOUNT_TO_TIER: Record<number, string> = {
  480:   'bronze',
  1200:  'copper',
  2500:  'silver',
  5000:  'gold',
  12000: 'platinum',
}

function verifyYocoSignature(rawBody: string, signature: string, secret: string): boolean {
  try {
    const hmac     = crypto.createHmac('sha256', secret)
    const expected = hmac.update(rawBody).digest('hex')
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex')
    )
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase()

  try {
    const rawBody = await req.text()
    const body    = JSON.parse(rawBody)

    // ── WEBHOOK from Yoco ──────────────────────────────────────
    if (body.type === 'payment.succeeded') {

      // Verify signature if secret is configured
      if (YOCO_WEBHOOK_SECRET) {
        const signature = req.headers.get('x-yoco-signature') || ''
        if (!signature || !verifyYocoSignature(rawBody, signature, YOCO_WEBHOOK_SECRET)) {
          console.error('Yoco signature verification failed')
          return new NextResponse('Invalid signature', { status: 401 })
        }
      }

      const payment      = body.payload
      const metadata     = payment.metadata || {}
      const userId       = metadata.user_id
      const refCode      = metadata.ref_code
      const amountRands  = Math.round(payment.amount / 100)
      const newTier      = AMOUNT_TO_TIER[amountRands] || 'bronze'

      if (!userId) {
        console.error('No user_id in Yoco webhook metadata')
        return new NextResponse('Missing user_id', { status: 400 })
      }

      // Update profile tier
      await supabase.from('profiles').update({
        paid_tier:      newTier,
        payment_status: 'paid',
        upgraded_at:    new Date().toISOString(),
      }).eq('id', userId)

      // Record transaction
      await supabase.from('transactions').insert({
        user_id:        userId,
        amount:         amountRands,
        tier:           newTier,
        pf_payment_id:  payment.id,
        payment_method: 'yoco',
        status:         'confirmed',
        referred_by:    refCode || null,
      })

      // ISP commission for sponsor
      if (refCode) {
        const { data: sponsor } = await supabase.from('profiles')
          .select('id,paid_tier,full_name').eq('referral_code', refCode).single()
        if (sponsor) {
          const ispRates: Record<string,number> = {
            fam:0.10, bronze:0.18, copper:0.22,
            silver:0.25, gold:0.28, platinum:0.30
          }
          const ispAmount = amountRands * (ispRates[sponsor.paid_tier] || 0.10)
          await supabase.from('comp_earnings').insert({
            user_id:        sponsor.id,
            builder_name:   sponsor.full_name,
            earning_type:   'ISP',
            amount:         ispAmount,
            source_user_id: userId,
            status:         'confirmed',
            notes:          `ISP on R${amountRands} ${newTier} upgrade`,
          })

          // Mark invite as registered
          await supabase.from('invitation_dispatches')
            .update({ registered:true, registered_at:new Date().toISOString() })
            .eq('ref_code', refCode)
            .eq('registered', false)
            .order('dispatched_at', { ascending:false })
            .limit(1)
        }
      }

      // Award Bronze Legacy badge
      await supabase.from('builder_badges').upsert({
        user_id:    userId,
        badge_id:   'bronze_legacy',
        badge_name: 'Bronze Legacy',
        awarded_at: new Date().toISOString(),
      }, { onConflict:'user_id,badge_id' })

      // Initialize builder records
      await supabase.from('builder_unlocks').upsert({ user_id:userId }, { onConflict:'user_id' })
      await supabase.from('torch_streaks').upsert({ user_id:userId }, { onConflict:'user_id' })

      // Send payment confirmation email
      fetch(`${APP_URL}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ type:'payment', user_id:userId, data:{ tier:newTier, amount:amountRands } })
      }).catch(()=>{})

      console.log(`✅ Yoco payment: ${userId} → ${newTier} (R${amountRands})`)
      return new NextResponse('OK', { status:200 })
    }

    // ── CREATE CHECKOUT ────────────────────────────────────────
    if (body.action === 'create_checkout') {
      const { user_id, ref_code, tier } = body
      const tierAmounts: Record<string,number> = {
        bronze:480, copper:1200, silver:2500, gold:5000, platinum:12000
      }
      const amountRands = tierAmounts[tier] || 480
      const amountCents = amountRands * 100

      const response = await fetch('https://payments.yoco.com/api/checkouts', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
        },
        body: JSON.stringify({
          amount:     amountCents,
          currency:   'ZAR',
          cancelUrl:  `${APP_URL}/pricing`,
          successUrl: `${APP_URL}/pay/success?tier=${tier}`,
          failureUrl: `${APP_URL}/pricing?error=payment_failed`,
          metadata: { user_id, ref_code: ref_code||'', tier },
          lineItems: [{
            displayName: `Z2B Table Banquet — ${tier.charAt(0).toUpperCase()+tier.slice(1)} Membership`,
            quantity: 1,
            pricingDetails: { price: amountCents }
          }]
        })
      })

      const checkout = await response.json()
      if (!response.ok) throw new Error(checkout.message || 'Yoco checkout failed')

      return NextResponse.json({ checkoutUrl:checkout.redirectUrl, checkoutId:checkout.id })
    }

    return NextResponse.json({ error:'Unknown action' }, { status:400 })

  } catch(e: any) {
    console.error('Yoco error:', e)
    return NextResponse.json({ error:e.message }, { status:500 })
  }
}
