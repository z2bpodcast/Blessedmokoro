// v2026-03-28 01:25 — Content Engine commissions
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

// ── Shared commission processor — used by both membership and Content Engine sales ──
async function processCommissions(
  supabase: any,
  buyerUserId: string,
  refCode: string,
  amountRands: number,
  productLabel: string
) {
  const ispRates: Record<string,number> = {
    fam:0.10, bronze:0.18, copper:0.22,
    silver:0.25, gold:0.28, platinum:0.30
  }

  // ── ISP — Direct sponsor ────────────────────────────────────
  const { data: sponsor } = await supabase.from('profiles')
    .select('id,paid_tier,full_name,referral_code').eq('referral_code', refCode).single()

  if (!sponsor) return

  const ispRate   = ispRates[sponsor.paid_tier] || 0.10
  const ispAmount = amountRands * ispRate

  await supabase.from('comp_earnings').insert({
    builder_id:       sponsor.id,
    earning_type:     'ISP',
    amount:           ispAmount,
    rate:             ispRate,
    source_builder_id:buyerUserId,
    sale_amount:      amountRands,
    status:           'confirmed',
    notes:            `ISP on R${amountRands} — ${productLabel}`,
  })

  // ── TSC — Walk up the upline tree ──────────────────────────
  const tscRates: Record<number,number> = {
    2:0.10, 3:0.05, 4:0.03, 5:0.02,
    6:0.01, 7:0.01, 8:0.01, 9:0.01, 10:0.01,
  }
  const maxGenByTier: Record<string,number> = {
    fam:0, bronze:3, copper:4, silver:6, gold:8, platinum:10
  }

  let currentRefCode = sponsor.referral_code
  let gen = 2

  while (gen <= 10 && currentRefCode) {
    // Find this builder's sponsor
    const { data: upline } = await supabase.from('profiles')
      .select('id,paid_tier,full_name,referred_by_code')
      .eq('referral_code', currentRefCode)
      .single()
    if (!upline) break

    const { data: uplinesUpline } = await supabase.from('profiles')
      .select('id,paid_tier,full_name,referral_code')
      .eq('referral_code', upline.referred_by_code || '')
      .single()
    if (!uplinesUpline) break

    const maxGen = maxGenByTier[uplinesUpline.paid_tier] || 0
    if (gen > maxGen) { currentRefCode = uplinesUpline.referral_code; gen++; continue }

    const tscRate   = tscRates[gen] || 0
    const tscAmount = amountRands * tscRate

    if (tscAmount > 0) {
      await supabase.from('comp_earnings').insert({
        builder_id:       uplinesUpline.id,
        earning_type:     'TSC',
        amount:           tscAmount,
        rate:             tscRate,
        source_builder_id:buyerUserId,
        generation:       gen,
        sale_amount:      amountRands,
        status:           'confirmed',
        notes:            `TSC Gen${gen} on R${amountRands} — ${productLabel}`,
      })
    }

    currentRefCode = uplinesUpline.referral_code
    gen++
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const body    = JSON.parse(rawBody)

    // ── WEBHOOK from Yoco ──────────────────────────────────────
    if (body.type === 'payment.succeeded') {
      // Supabase only needed for webhook processing
      const supabase = getSupabase()

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
      // Content Engine product detection
      const productType  = metadata.product_type || 'membership'
      const isContentEngine = productType === 'content_engine'
      const cePlan       = metadata.ce_plan || null   // 'starter'|'pro'

      if (!userId) {
        console.error('No user_id in Yoco webhook metadata')
        return new NextResponse('Missing user_id', { status: 400 })
      }

      // ── CONTENT ENGINE PAYMENT ──────────────────────────────
      if (isContentEngine && cePlan) {
        // Grant paid plan access
        await supabase.rpc('admin_grant_ce_plan', {
          target_user_id: userId,
          plan_name:      cePlan,
        })
        // Record transaction
        await supabase.from('transactions').insert({
          user_id:        userId,
          amount:         amountRands,
          tier:           `ce_${cePlan}`,
          pf_payment_id:  payment.id,
          payment_method: 'yoco',
          status:         'confirmed',
          referred_by:    refCode || null,
          notes:          `Content Engine ${cePlan} plan`,
        })
        // Process commissions through the comp engine
        if (refCode) {
          await processCommissions(supabase, userId, refCode, amountRands, `Content Engine ${cePlan}`)
        }
        console.log(`✅ Content Engine: ${userId} → ${cePlan} (R${amountRands})`)
        return new NextResponse('OK', { status:200 })
      }

      // ── MEMBERSHIP PAYMENT (existing flow) ───────────────────
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

      // Process ISP + TSC commissions through shared engine
      if (refCode) {
        await processCommissions(supabase, userId, refCode, amountRands, `${newTier} membership`)
        // Mark invite as registered
        await supabase.from('invitation_dispatches')
          .update({ registered:true, registered_at:new Date().toISOString() })
          .eq('ref_code', refCode)
          .eq('registered', false)
          .order('dispatched_at', { ascending:false })
          .limit(1)
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

      // ── AI Income unlock ───────────────────────────────────────
      if (newTier === 'ai_income') {
        const refCode = metadata.ref_code || ''
        // Unlock for buyer
        await supabase.from('ai_income_unlocks').upsert(
          { user_id: userId, referred_by: refCode || null, amount_paid: amountRands },
          { onConflict: 'user_id' }
        )
        // Commission for referrer
        if (refCode) {
          const { data: referrer } = await supabase
            .from('profiles').select('id').eq('referral_code', refCode).single()
          if (referrer) {
            await supabase.from('ai_income_commissions').insert({
              referrer_id: referrer.id,
              referred_id: userId,
              amount: 200,
              status: 'pending',
            })
          }
        }
        console.log(`✅ AI Income unlocked: ${userId}`)
        return new NextResponse('OK', { status:200 })
      }
      // ─────────────────────────────────────────────────────────

      console.log(`✅ Yoco payment: ${userId} → ${newTier} (R${amountRands})`)
      return new NextResponse('OK', { status:200 })
    }

    // ── CREATE CHECKOUT ────────────────────────────────────────
    if (body.action === 'create_checkout') {
      const { user_id, ref_code, tier } = body
      const tierAmounts: Record<string,number> = {
        bronze:480, copper:1200, silver:2500, gold:5000, platinum:12000,
        // Content Engine plans
        ce_starter: 400, ce_pro: 900,
        // AI Income Execution System
        ai_income: 500,
      }
      const amountRands = tierAmounts[tier] || 480
      const isCECheckout = tier.startsWith('ce_')
      const cePlanName   = isCECheckout ? tier.replace('ce_','') : null
      const amountCents = amountRands * 100

      if (!YOCO_SECRET_KEY) {
        console.error('YOCO_SECRET_KEY is not set in environment variables')
        return NextResponse.json({ error: 'Payment not configured. Contact support.' }, { status: 503 })
      }

      console.log(`Creating Yoco checkout: tier=${tier} amount=R${amountRands} user=${user_id}`)
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
          successUrl: isCECheckout ? `${APP_URL}/content-studio-plus?activated=true` : tier === 'ai_income' ? `${APP_URL}/ai-income?activated=true` : `${APP_URL}/pay/success?tier=${tier}`,
          failureUrl: `${APP_URL}/pricing?error=payment_failed`,
          metadata: {
            user_id,
            ref_code:     ref_code||'',
            tier,
            product_type: isCECheckout ? 'content_engine' : 'membership',
            ce_plan:      cePlanName || '',
          },
          lineItems: [{
            displayName: `Z2B Table Banquet — ${tier.charAt(0).toUpperCase()+tier.slice(1)} Membership`,
            quantity: 1,
            pricingDetails: { price: amountCents }
          }]
        })
      })

      // Safe parse Yoco response
      let checkout: any = {}
      const yocoText = await response.text()
      try { if (yocoText) checkout = JSON.parse(yocoText) } catch {}

      if (!response.ok) {
        const errMsg = checkout.message || checkout.error || checkout.displayMessage || `Yoco error ${response.status}`
        console.error('Yoco checkout failed:', response.status, yocoText)
        // Return descriptive error — not a throw, so we get proper JSON back
        return NextResponse.json({ error: errMsg }, { status: 502 })
      }

      if (!checkout.redirectUrl) {
        console.error('Yoco returned no redirectUrl:', yocoText)
        return NextResponse.json({ error: 'Yoco did not return a payment URL. Check YOCO_SECRET_KEY.' }, { status: 502 })
      }

      return NextResponse.json({ checkoutUrl:checkout.redirectUrl, checkoutId:checkout.id })
    }

    return NextResponse.json({ error:'Unknown action' }, { status:400 })

  } catch(e: any) {
    console.error('Yoco error:', e)
    return NextResponse.json({ error:e.message }, { status:500 })
  }
}
