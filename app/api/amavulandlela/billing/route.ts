// ============================================================
// app/api/amavulandlela/billing/route.ts
// Initiates PayFast recurring subscription for Amavulandlela
// Zero2Billionaires Amavulandlela Pty Ltd
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const MERCHANT_ID  = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID!
const MERCHANT_KEY = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY!
const BASE_URL     = process.env.NEXT_PUBLIC_APP_URL || 'https://app.z2blegacybuilders.co.za'
const PAYFAST_URL  = 'https://www.payfast.co.za/eng/process'

const MEMBER_PRICES: Record<string, Record<string, number>> = {
  member:     { solo: 199, multi: 399, white_label: 799  },
  non_member: { solo: 499, multi: 999, white_label: 2500 },
}

const PLAN_NAMES: Record<string, string> = {
  solo:        'Amavulandlela Pathfinder Solo',
  multi:       'Amavulandlela Pathfinder Multi',
  white_label: 'Amavulandlela Pathfinder White Label',
}

function generateSignature(data: Record<string, string>, passphrase?: string): string {
  let str = Object.entries(data)
    .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, '+')}`)
    .join('&')
  if (passphrase) str += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
  return crypto.createHash('md5').update(str).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user } } = await supabase.auth.getUser()

    const body = await req.json()
    const { plan, customer_type, referral_code, white_label_brand } = body

    if (!plan || !customer_type) {
      return NextResponse.json({ error: 'Plan and customer_type required' }, { status: 400 })
    }

    const amount   = MEMBER_PRICES[customer_type]?.[plan]
    const planName = PLAN_NAMES[plan]
    if (!amount || !planName) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    let email     = body.email || ''
    let firstName = 'Amavulandlela'
    let lastName  = 'User'

    if (user) {
      const { data: profile } = await supabase
        .from('profiles').select('full_name').eq('id', user.id).single()
      if (profile?.full_name) {
        const parts = profile.full_name.split(' ')
        firstName = parts[0] || firstName
        lastName  = parts.slice(1).join(' ') || lastName
      }
    }

    const { data: sub, error: subError } = await supabase
      .from('amavulandlela_subscriptions')
      .insert({
        user_id:           user?.id || null,
        email,
        customer_type,
        plan,
        member_tier:       null,
        monthly_amount:    amount,
        status:            'pending',
        referred_by:       referral_code || null,
        commission_rate:   20,
        is_white_label:    plan === 'white_label',
        white_label_brand: white_label_brand || null,
      })
      .select()
      .single()

    if (subError || !sub) {
      console.error('Subscription insert error:', subError)
      return NextResponse.json({ error: 'Failed to create subscription record' }, { status: 500 })
    }

    const paymentData: Record<string, string> = {
      merchant_id:       MERCHANT_ID,
      merchant_key:      MERCHANT_KEY,
      return_url:        `${BASE_URL}/social-command?ava=success`,
      cancel_url:        `${BASE_URL}/marketplace/apps?ava=cancelled`,
      notify_url:        `${BASE_URL}/api/amavulandlela/webhook`,
      name_first:        firstName,
      name_last:         lastName,
      email_address:     email,
      m_payment_id:      sub.id,
      amount:            amount.toFixed(2),
      item_name:         planName,
      item_description:  `${planName} — Monthly Subscription`,
      subscription_type: '1',
      billing_date:      new Date().toISOString().split('T')[0],
      recurring_amount:  amount.toFixed(2),
      frequency:         '3',
      cycles:            '0',
      custom_str1:       sub.id,
      custom_str2:       referral_code || '',
      custom_str3:       customer_type,
      custom_str4:       plan,
    }

    const passphrase = process.env.PAYFAST_PASSPHRASE
    paymentData.signature = generateSignature(paymentData, passphrase)

    return NextResponse.json({
      payfast_url:     PAYFAST_URL,
      payment_data:    paymentData,
      subscription_id: sub.id,
    })

  } catch (error) {
    console.error('amavulandlela/billing error:', error)
    return NextResponse.json({ error: 'Billing initiation failed' }, { status: 500 })
  }
}
