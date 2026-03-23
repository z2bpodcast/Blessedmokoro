import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// FILE: app/api/payfast/route.ts
// PayFast payment notify webhook + signature verification
// Receives ITN (Instant Transaction Notification) from PayFast

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PAYFAST_MERCHANT_ID  = process.env.PAYFAST_MERCHANT_ID || ''
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || ''
const PAYFAST_PASSPHRASE   = process.env.PAYFAST_PASSPHRASE || ''

// Tier mapping based on amount paid
const AMOUNT_TO_TIER: Record<number, string> = {
  480:   'bronze',
  1200:  'copper',
  2500:  'silver',
  5000:  'gold',
  12000: 'platinum',
}

function verifySignature(data: Record<string, string>, signature: string): boolean {
  // Build parameter string
  const paramString = Object.keys(data)
    .filter(key => key !== 'signature' && data[key] !== '')
    .sort()
    .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
    .join('&')

  const stringToHash = PAYFAST_PASSPHRASE
    ? `${paramString}&passphrase=${encodeURIComponent(PAYFAST_PASSPHRASE)}`
    : paramString

  const hash = crypto.createHash('md5').update(stringToHash).digest('hex')
  return hash === signature
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  try {
    const body = await req.text()
    const params = Object.fromEntries(new URLSearchParams(body))

    console.log('PayFast ITN received:', params)

    // 1. Verify signature
    const signature = params.signature
    if (!verifySignature(params, signature)) {
      console.error('PayFast signature verification failed')
      return new NextResponse('Invalid signature', { status: 400 })
    }

    // 2. Check payment status
    if (params.payment_status !== 'COMPLETE') {
      console.log('Payment not complete:', params.payment_status)
      return new NextResponse('OK', { status: 200 })
    }

    // 3. Extract data
    const userId    = params.custom_str1  // We pass user_id as custom_str1
    const refCode   = params.custom_str2  // referral code as custom_str2
    const amount    = Math.round(parseFloat(params.amount_gross))
    const pfPaymentId = params.pf_payment_id

    if (!userId) {
      console.error('No user_id in PayFast ITN')
      return new NextResponse('Missing user_id', { status: 400 })
    }

    // 4. Determine tier from amount
    const newTier = AMOUNT_TO_TIER[amount] || 'bronze'

    // 5. Update profile tier
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        paid_tier:      newTier,
        payment_status: 'paid',
        upgraded_at:    new Date().toISOString(),
      })
      .eq('id', userId)

    if (profileError) throw profileError

    // 6. Record transaction
    await supabase.from('transactions').insert({
      user_id:         userId,
      amount:          amount,
      tier:            newTier,
      pf_payment_id:   pfPaymentId,
      payment_method:  'payfast',
      status:          'confirmed',
      referred_by:     refCode || null,
    })

    // 7. Process commission for sponsor if referred
    if (refCode) {
      const { data: sponsor } = await supabase
        .from('profiles')
        .select('id, paid_tier, full_name')
        .eq('referral_code', refCode)
        .single()

      if (sponsor) {
        const ispRates: Record<string, number> = {
          fam: 0.10, bronze: 0.18, copper: 0.22,
          silver: 0.25, gold: 0.28, platinum: 0.30
        }
        const ispRate    = ispRates[sponsor.paid_tier] || 0.10
        const ispAmount  = amount * ispRate

        await supabase.from('comp_earnings').insert({
          user_id:       sponsor.id,
          builder_name:  sponsor.full_name,
          earning_type:  'ISP',
          amount:        ispAmount,
          source_user_id: userId,
          status:        'confirmed',
          notes:         `ISP ${Math.round(ispRate * 100)}% on R${amount} ${newTier} upgrade`,
        })

        // Mark invite as paid
        await supabase.from('invitation_dispatches')
          .update({ registered: true })
          .eq('ref_code', refCode)
          .eq('registered', false)
          .order('dispatched_at', { ascending: false })
          .limit(1)
      }
    }

    // 8. Award Bronze Legacy badge
    await supabase.from('builder_badges').upsert({
      user_id:    userId,
      badge_id:   'bronze_legacy',
      badge_name: 'Bronze Legacy',
      awarded_at: new Date().toISOString(),
    }, { onConflict: 'user_id,badge_id' })

    // 9. Initialize builder records
    await supabase.from('builder_unlocks').upsert({ user_id: userId }, { onConflict: 'user_id' })
    await supabase.from('torch_streaks').upsert({ user_id: userId }, { onConflict: 'user_id' })

    console.log(`✅ Payment processed: ${userId} → ${newTier} (R${amount})`)
    return new NextResponse('OK', { status: 200 })

  } catch(e: any) {
    console.error('PayFast webhook error:', e)
    return new NextResponse('Error', { status: 500 })
  }
}
