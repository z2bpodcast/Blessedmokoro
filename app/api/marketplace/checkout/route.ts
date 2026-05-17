// ============================================================
// Z2B — MARKETPLACE CHECKOUT API
// File: app/api/marketplace/checkout/route.ts
// Routes payment to Yoco or PayFast
// Records sale and triggers download link on success
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.z2blegacybuilders.co.za'

async function getUser(req: NextRequest) {
  const sb    = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return { user: null, sb }
  const { data: { user } } = await sb.auth.getUser(token)
  return { user, sb }
}

export async function POST(req: NextRequest) {
  const { user, sb } = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Please log in to purchase' }, { status: 401 })

  const { productId, amount, provider, buyerEmail } = await req.json()
  if (!productId || !amount || !provider) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  // Load product
  const { data: product } = await (sb.from as any)('marketplace_products')
    .select('id, title, name, seller_id, builder_id, retail_price, seller_earnings, z2b_commission, affiliate_enabled')
    .eq('id', productId)
    .maybeSingle() as { data: any }

  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const refCode    = req.headers.get('x-ref-code') ?? ''
  const productTitle = product.title ?? product.name ?? 'Digital Product'
  const amountCents = Math.round(amount * 100)

  // ── YOCO CHECKOUT ─────────────────────────────────────────
  if (provider === 'yoco') {
    try {
      const yocoRes = await fetch('https://payments.yoco.com/api/checkouts', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': 'Bearer ' + process.env.YOCO_SECRET_KEY,
        },
        body: JSON.stringify({
          amount:      amountCents,
          currency:    'ZAR',
          cancelUrl:   `${APP_URL}/marketplace?cancelled=1`,
          successUrl:  `${APP_URL}/marketplace/success?product=${productId}&ref=${refCode}`,
          metadata: {
            productId,
            buyerId:   user.id,
            buyerEmail: buyerEmail ?? user.email,
            refCode,
          },
        }),
      })
      const yocoData = await yocoRes.json()
      if (yocoData.redirectUrl) return NextResponse.json({ redirectUrl: yocoData.redirectUrl })
      return NextResponse.json({ error: 'Yoco checkout failed. Please try another payment method.' }, { status: 500 })
    } catch (_) {
      return NextResponse.json({ error: 'Yoco unavailable. Please try EFT.' }, { status: 500 })
    }
  }

  // ── PAYFAST CHECKOUT ──────────────────────────────────────
  if (provider === 'payfast') {
    const merchantId  = process.env.PAYFAST_MERCHANT_ID ?? ''
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY ?? ''

    const params = new URLSearchParams({
      merchant_id:      merchantId,
      merchant_key:     merchantKey,
      return_url:       `${APP_URL}/marketplace/success?product=${productId}&ref=${refCode}`,
      cancel_url:       `${APP_URL}/marketplace?cancelled=1`,
      notify_url:       `${APP_URL}/api/marketplace/webhook/payfast`,
      name_first:       buyerEmail?.split('@')[0] ?? 'Buyer',
      email_address:    buyerEmail ?? '',
      amount:           amount.toFixed(2),
      item_name:        productTitle.slice(0, 100),
      custom_str1:      productId,
      custom_str2:      user.id,
      custom_str3:      refCode,
    })

    const redirectUrl = `https://www.payfast.co.za/eng/process?${params.toString()}`
    return NextResponse.json({ redirectUrl })
  }

  return NextResponse.json({ error: 'Unknown payment provider' }, { status: 400 })
}
