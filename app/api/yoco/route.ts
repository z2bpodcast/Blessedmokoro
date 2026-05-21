import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ═══════════════════════════════════════════════════════════════════
// FILE: app/api/yoco/route.ts
// Z2B UNIFIED PAYMENT GATEWAY
// Handles: Tier Upgrades + Marketplace Sales
// Payments: Yoco Card | EFT | Nedbank ATM
// ═══════════════════════════════════════════════════════════════════

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.z2blegacybuilders.co.za'

// ── TIER AMOUNTS ──────────────────────────────────────────────────
const AMOUNT_TO_TIER: Record<number, string> = {
  700:   'starter',
  2500:  'bronze',
  5000:  'copper',
  12000: 'silver',
  25000: 'gold',
  50000: 'platinum',
}

// ── ISP RATES PER TIER ────────────────────────────────────────────
const ISP_RATES: Record<string, number> = {
  fam:      0.10,
  starter:  0.10,
  bronze:   0.18,
  copper:   0.22,
  silver:   0.25,
  gold:     0.28,
  platinum: 0.30,
}

// ── MARKETPLACE PRODUCTS ──────────────────────────────────────────
const MARKETPLACE_PRODUCTS: Record<string, { name: string; price: number }> = {
  'zero2billionaires-ebook': {
    name:  'Zero2Billionaires eBook',
    price: 200,
  },
  // Future products added here
}

const MARKETPLACE_COMMISSION_RATE = 0.20 // 20% flat — no upline

// ═══════════════════════════════════════════════════════════════════
// POST — handles both checkout creation AND Yoco webhook
// ═══════════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  const supabase = getSupabase()

  try {
    const body = await req.json()

    // ────────────────────────────────────────────────────────────────
    // 1. YOCO WEBHOOK — payment.succeeded
    // ────────────────────────────────────────────────────────────────
    if (body.type === 'payment.succeeded') {
      const payment     = body.payload
      const metadata    = payment.metadata || {}
      const userId      = metadata.user_id
      const refCode     = metadata.ref_code || null
      const saleType    = metadata.sale_type || 'tier'      // 'tier' | 'marketplace'
      const productId   = metadata.product_id || null
      const buyerEmail  = metadata.buyer_email || null
      const buyerName   = metadata.buyer_name  || null
      const amountRands = Math.round(payment.amount / 100)  // Yoco sends cents

      // ── MARKETPLACE SALE ────────────────────────────────────────
      if (saleType === 'marketplace' && productId) {
        const product    = MARKETPLACE_PRODUCTS[productId]
        const commission = refCode
          ? amountRands * MARKETPLACE_COMMISSION_RATE
          : 0

        // Record sale
        await supabase.from('marketplace_sales').insert({
          product_id:       productId,
          product_name:     product?.name || productId,
          amount:           amountRands,
          affiliate_ref:    refCode,
          commission_amount: commission,
          commission_rate:  MARKETPLACE_COMMISSION_RATE,
          payment_method:   'yoco',
          yoco_charge_id:   payment.id,
          buyer_email:      buyerEmail,
          buyer_name:       buyerName,
          status:           'paid',
          created_at:       new Date().toISOString(),
        })

        // Credit affiliate — 20% flat, NO upline
        if (refCode && commission > 0) {
          await supabase.from('affiliate_commissions').insert({
            ref_code:         refCode,
            product_id:       productId,
            commission_amount: commission,
            payment_method:   'yoco',
            yoco_charge_id:   payment.id,
            buyer_email:      buyerEmail,
            status:           'approved',
            created_at:       new Date().toISOString(),
          })
        }

        // TODO: trigger eBook delivery email via Resend
        return new NextResponse('Marketplace sale recorded', { status: 200 })
      }

      // ── TIER UPGRADE ─────────────────────────────────────────────
      if (!userId) {
        console.error('No user_id in Yoco webhook metadata')
        return new NextResponse('Missing user_id', { status: 400 })
      }

      const newTier = AMOUNT_TO_TIER[amountRands] || 'starter'

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

      // ISP commission for sponsor — full comp plan applies
      if (refCode) {
        const { data: sponsor } = await supabase
          .from('profiles')
          .select('id, paid_tier, full_name')
          .eq('referral_code', refCode)
          .single()

        if (sponsor) {
          const ispAmount = amountRands * (ISP_RATES[sponsor.paid_tier] || 0.10)

          await supabase.from('comp_earnings').insert({
            user_id:        sponsor.id,
            builder_name:   sponsor.full_name,
            earning_type:   'ISP',
            amount:         ispAmount,
            source_user_id: userId,
            status:         'confirmed',
            notes:          `ISP on R${amountRands} ${newTier} upgrade`,
          })

          // Mark referral as converted
          await supabase
            .from('referrals')
            .update({ status: 'converted', converted_at: new Date().toISOString() })
            .eq('ref_code', refCode)
            .eq('referred_user_id', userId)
        }
      }

      return new NextResponse('Tier upgrade processed', { status: 200 })
    }

    // ────────────────────────────────────────────────────────────────
    // 2. CREATE YOCO CHECKOUT — called from /register page
    // ────────────────────────────────────────────────────────────────
    if (body.action === 'create_checkout') {
      const {
        user_id,
        ref_code,
        tier,
        amount,
        // Marketplace fields
        sale_type   = 'tier',
        product_id  = null,
        buyer_email = null,
        buyer_name  = null,
      } = body

      const amountCents = Math.round(amount * 100)

      // Build display name
      const isMarketplace = sale_type === 'marketplace'
      const product       = product_id ? MARKETPLACE_PRODUCTS[product_id] : null
      const displayName   = isMarketplace
        ? `Z2B Marketplace — ${product?.name || product_id}`
        : `Z2B Legacy Builders — ${tier?.charAt(0).toUpperCase() + tier?.slice(1)} Membership`

      // Build success / cancel URLs
      const successUrl = isMarketplace
        ? `${APP_URL}/marketplace?payment=success&product=${product_id}&ref=${ref_code || ''}`
        : `${APP_URL}/pay/success?tier=${tier}`
      const cancelUrl = isMarketplace
        ? `${APP_URL}/marketplace?payment=cancelled`
        : `${APP_URL}/pricing`
      const failureUrl = isMarketplace
        ? `${APP_URL}/marketplace?payment=failed`
        : `${APP_URL}/pricing?error=payment_failed`

      const response = await fetch('https://payments.yoco.com/api/checkouts', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
        },
        body: JSON.stringify({
          amount:     amountCents,
          currency:   'ZAR',
          cancelUrl,
          successUrl,
          failureUrl,
          metadata: {
            user_id:     user_id    || null,
            ref_code:    ref_code   || null,
            tier:        tier       || null,
            sale_type,
            product_id,
            buyer_email,
            buyer_name,
          },
          lineItems: [{
            displayName,
            quantity: 1,
            pricingDetails: { price: amountCents },
          }],
        }),
      })

      const checkout = await response.json()
      if (!response.ok) throw new Error(checkout.message || 'Yoco checkout failed')

      return NextResponse.json({
        checkoutUrl: checkout.redirectUrl,
        checkoutId:  checkout.id,
      })
    }

    // ────────────────────────────────────────────────────────────────
    // 3. RECORD MANUAL PAYMENT (EFT / Nedbank ATM)
    //    Called when buyer clicks "I have made payment" button
    // ────────────────────────────────────────────────────────────────
    if (body.action === 'record_manual_payment') {
      const {
        payment_method, // 'eft' | 'nedbank_atm'
        sale_type = 'tier',
        product_id,
        amount,
        ref_code,
        buyer_email,
        buyer_name,
        user_id,
        tier,
      } = body

      const isMarketplace = sale_type === 'marketplace'

      if (isMarketplace && product_id) {
        const commission = ref_code
          ? amount * MARKETPLACE_COMMISSION_RATE
          : 0

        await supabase.from('marketplace_sales').insert({
          product_id,
          product_name:     MARKETPLACE_PRODUCTS[product_id]?.name || product_id,
          amount,
          affiliate_ref:    ref_code || null,
          commission_amount: commission,
          commission_rate:  MARKETPLACE_COMMISSION_RATE,
          payment_method,
          buyer_email,
          buyer_name,
          status:           'pending', // pending until admin confirms EFT/ATM
          created_at:       new Date().toISOString(),
        })

        // Affiliate commission stays pending until admin confirms
        if (ref_code && commission > 0) {
          await supabase.from('affiliate_commissions').insert({
            ref_code,
            product_id,
            commission_amount: commission,
            payment_method,
            buyer_email,
            status:     'pending',
            created_at: new Date().toISOString(),
          })
        }

        return NextResponse.json({ success: true, status: 'pending' })
      }

      // Tier — record pending transaction
      if (user_id && tier) {
        await supabase.from('transactions').insert({
          user_id,
          amount,
          tier,
          payment_method,
          status:      'pending',
          referred_by: ref_code || null,
        })
      }

      return NextResponse.json({ success: true, status: 'pending' })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  } catch (e: any) {
    console.error('Z2B Yoco gateway error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
