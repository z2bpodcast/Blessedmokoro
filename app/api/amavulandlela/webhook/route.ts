// ============================================================
// app/api/amavulandlela/webhook/route.ts
// PayFast webhook — activates / renews / suspends subscriptions
// Triggers commission records for referrers
// Zero2Billionaires Amavulandlela Pty Ltd
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// Use service role for webhook (no user session)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function verifySignature(data: Record<string, string>, passphrase?: string): boolean {
  const { signature, ...rest } = data
  let str = Object.entries(rest)
    .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, '+')}`)
    .join('&')
  if (passphrase) str += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
  const expected = crypto.createHash('md5').update(str).digest('hex')
  return expected === signature
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const params: Record<string, string> = {}
    new URLSearchParams(body).forEach((v, k) => { params[k] = v })

    // Verify PayFast signature
    const passphrase = process.env.PAYFAST_PASSPHRASE
    if (!verifySignature(params, passphrase)) {
      console.error('Amavulandlela webhook: invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const paymentStatus  = params.payment_status   // COMPLETE | FAILED | CANCELLED
    const subscriptionId = params.custom_str1       // our subscription UUID
    const referralCode   = params.custom_str2
    const customerType   = params.custom_str3
    const plan           = params.custom_str4
    const amountPaid     = parseFloat(params.amount_gross || '0')
    const payfastToken   = params.token             // recurring billing token
    const payfastPayId   = params.pf_payment_id

    if (!subscriptionId) {
      return NextResponse.json({ error: 'No subscription ID' }, { status: 400 })
    }

    // ── PAYMENT COMPLETE ────────────────────────────────────
    if (paymentStatus === 'COMPLETE') {

      // Activate subscription
      const nextBilling = new Date()
      nextBilling.setMonth(nextBilling.getMonth() + 1)

      await supabase
        .from('amavulandlela_subscriptions')
        .update({
          status: 'active',
          payfast_token: payfastToken,
          payfast_payment_id: payfastPayId,
          activated_at: new Date().toISOString(),
          next_billing_date: nextBilling.toISOString(),
          grace_period_ends: null,
        })
        .eq('id', subscriptionId)

      // ── Commission tracking ─────────────────────────────
      if (referralCode) {
        // Resolve referrer user_id from referral_code
        const { data: referrer } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', referralCode)
          .single()

        const commissionAmount = amountPaid * 0.20  // 20%
        const billingPeriod    = new Date().toISOString().substring(0, 7) // e.g. '2025-07'

        await supabase.from('amavulandlela_commissions').insert({
          subscription_id:  subscriptionId,
          referrer_code:    referralCode,
          referrer_user_id: referrer?.id || null,
          amount_billed:    amountPaid,
          commission_amount: commissionAmount,
          commission_rate:  20,
          status:           'pending',
          billing_period:   billingPeriod,
          payfast_payment_id: payfastPayId,
        })
      }
    }

    // ── PAYMENT FAILED — start grace period ─────────────────
    if (paymentStatus === 'FAILED') {
      const graceEnd = new Date()
      graceEnd.setDate(graceEnd.getDate() + 3)  // 3-day grace

      await supabase
        .from('amavulandlela_subscriptions')
        .update({
          status: 'grace',
          grace_period_ends: graceEnd.toISOString(),
        })
        .eq('id', subscriptionId)

      // Log reminder record (cron job reads this to send emails)
      const { data: sub } = await supabase
        .from('amavulandlela_subscriptions')
        .select('email')
        .eq('id', subscriptionId)
        .single()

      await supabase.from('amavulandlela_reminders').insert({
        subscription_id: subscriptionId,
        reminder_type:   'grace_start',
        email:           sub?.email || '',
      })
    }

    // ── CANCELLED ────────────────────────────────────────────
    if (paymentStatus === 'CANCELLED') {
      await supabase
        .from('amavulandlela_subscriptions')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', subscriptionId)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('amavulandlela/webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
