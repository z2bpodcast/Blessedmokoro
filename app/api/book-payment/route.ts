// app/api/book-payment/route.ts
// Handles book purchase flow:
// 1. Creates FAM account for new buyer
// 2. Returns PayFast payment URL with correct credentials

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PACKAGES: Record<string, { amount: string; item: string; tier: string }> = {
  r200: { amount: '200.00', item: 'Zero2Billionaires Flipbook',        tier: 'flipbook' },
  r700: { amount: '700.00', item: 'Zero2Billionaires Full Book System', tier: 'starter' },
}

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, phone, pkg, ref, password } = await req.json()

    if (!fullName || !email || !phone || !pkg) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }

    const pkgData = PACKAGES[pkg]
    if (!pkgData) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
    }

    const supabase = getSupabase()

    // ── Create or find user account ──────────────────────────
    const { data: existing } = await supabase
      .from('profiles')
      .select('id, referral_code')
      .eq('email', email.toLowerCase().trim())
      .single()

    let userId = existing?.id
    let referralCode = existing?.referral_code

    if (!existing) {
      // Create new FAM account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        password: password || Math.random().toString(36).slice(2, 10) + 'Z2B!',
        email_confirm: true,
        user_metadata: { full_name: fullName },
      })

      if (authError && !authError.message.includes('already')) {
        console.error('Auth error:', authError)
      }

      userId = authData?.user?.id

      if (userId) {
        referralCode = `${fullName.slice(0,3).toUpperCase().replace(/\s/g,'')}${Math.random().toString(36).slice(2,6).toUpperCase()}`

        // Find sponsor
        let sponsorId = null
        if (ref) {
          const { data: sponsor } = await supabase
            .from('profiles').select('id')
            .eq('referral_code', ref.toUpperCase()).single()
          sponsorId = sponsor?.id || null
        }

        await supabase.from('profiles').upsert({
          id: userId,
          email: email.toLowerCase().trim(),
          full_name: fullName,
          user_role: 'fam',
          paid_tier: 'fam',
          is_paid_member: false,
          payment_status: 'free',
          referral_code: referralCode,
          referred_by: sponsorId,
          whatsapp_number: phone,
          joined_via: 'book_landing_' + pkg,
        })
      }
    }

    // ── Build PayFast form data ───────────────────────────────
    const merchantId  = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID  || ''
    const merchantKey = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || ''
    const baseUrl     = 'https://app.z2blegacybuilders.co.za'

    const paymentData = {
      merchant_id:  merchantId,
      merchant_key: merchantKey,
      return_url:   `${baseUrl}/dashboard?upgraded=${pkgData.tier}&from=book`,
      cancel_url:   `${baseUrl}/book_landing.html`,
      notify_url:   `${baseUrl}/api/payfast`,
      name_first:   fullName.split(' ')[0],
      name_last:    fullName.split(' ').slice(1).join(' ') || 'Z2B',
      email_address: email.toLowerCase().trim(),
      m_payment_id: `BOOK-${pkg.toUpperCase()}-${userId || Date.now()}`,
      amount:       pkgData.amount,
      item_name:    pkgData.item,
      custom_str1:  userId || '',
      custom_str2:  referralCode || '',
      custom_str3:  pkg,
    }

    return NextResponse.json({ 
      success: true,
      paymentData,
      payfastUrl: 'https://www.payfast.co.za/eng/process',
    })

  } catch (err: any) {
    console.error('Book payment error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
