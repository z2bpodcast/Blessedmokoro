// FILE: app/api/affiliate/route.ts
// Affiliate system — click tracking, link generation, earnings, payouts
// Revenue rules:
//   Builder own product: 90% direct, 70% if affiliate drives sale
//   Influencer partnership: Builder 30%, Influencer 70%
//   Affiliate: 20% of product price (10% from each party in partnership)
//   Own product affiliate: full 20% from builder's 90%
//   NO upline cascade on marketplace sales

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
export const dynamic = 'force-dynamic'

function generateCode(seed: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body

  // ── Track affiliate click ─────────────────────────────────────────
  if (action === 'click') {
    const { ref, product_slug, referrer } = body
    if (!ref) return NextResponse.json({ ok: false })

    // Find affiliate by code
    const { data: aff } = await supabase
      .from('marketplace_affiliates')
      .select('id')
      .eq('affiliate_code', ref.toUpperCase())
      .single()

    if (!aff) return NextResponse.json({ ok: false })

    // Find product
    const { data: product } = await supabase
      .from('marketplace_products')
      .select('id')
      .eq('slug', product_slug)
      .single()

    // Log click
    await supabase.from('affiliate_clicks').insert({
      affiliate_id: aff.id,
      product_id: product?.id || null,
      referrer,
      clicked_at: new Date().toISOString(),
    })

    // Increment link clicks
    if (product?.id) {
      await supabase.from('affiliate_links')
        .update({ clicks: supabase.rpc('increment', { x: 1 }) })
        .eq('affiliate_id', aff.id)
        .eq('product_id', product.id)
    }

    return NextResponse.json({ ok: true })
  }

  // ── Generate affiliate link for a product ─────────────────────────
  if (action === 'generate_link') {
    const { affiliateId, productId } = body

    // Check if link already exists
    const { data: existing } = await supabase
      .from('affiliate_links')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .eq('product_id', productId)
      .single()

    if (existing) {
      const { data: aff } = await supabase
        .from('marketplace_affiliates')
        .select('affiliate_code')
        .eq('id', affiliateId)
        .single()

      const { data: product } = await supabase
        .from('marketplace_products')
        .select('slug')
        .eq('id', productId)
        .single()

      return NextResponse.json({
        link: `https://marketplace.z2blegacybuilders.co.za/p/${product?.slug}?ref=${aff?.affiliate_code}`,
        code: aff?.affiliate_code,
        stats: { clicks: existing.clicks, conversions: existing.conversions, earned: existing.total_earned },
      })
    }

    // Create new affiliate link
    const { data: aff } = await supabase
      .from('marketplace_affiliates')
      .select('affiliate_code')
      .eq('id', affiliateId)
      .single()

    const { data: product } = await supabase
      .from('marketplace_products')
      .select('slug')
      .eq('id', productId)
      .single()

    await supabase.from('affiliate_links').insert({
      affiliate_id: affiliateId,
      product_id: productId,
      link_code: aff?.affiliate_code || generateCode(''),
    })

    return NextResponse.json({
      link: `https://marketplace.z2blegacybuilders.co.za/p/${product?.slug}?ref=${aff?.affiliate_code}`,
      code: aff?.affiliate_code,
    })
  }

  // ── Register as external affiliate (non-member) ───────────────────
  if (action === 'register_external') {
    const { email, fullName } = body
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const { data: existing } = await supabase
      .from('marketplace_affiliates')
      .select('id, affiliate_code')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json({ affiliateId: existing.id, code: existing.affiliate_code, existing: true })
    }

    const code = generateCode(email)
    const { data: newAff, error } = await supabase
      .from('marketplace_affiliates')
      .insert({
        email: email.toLowerCase(),
        full_name: fullName,
        is_z2b_member: false,
        affiliate_code: code,
        status: 'active',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ affiliateId: newAff.id, code: newAff.affiliate_code })
  }

  // ── Get affiliate earnings dashboard ─────────────────────────────
  if (action === 'get_earnings') {
    const { affiliateId, email } = body

    let affId = affiliateId
    if (!affId && email) {
      const { data: aff } = await supabase
        .from('marketplace_affiliates')
        .select('id')
        .eq('email', email.toLowerCase())
        .single()
      affId = aff?.id
    }

    if (!affId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: aff } = await supabase
      .from('marketplace_affiliates')
      .select('*')
      .eq('id', affId)
      .single()

    const { data: links } = await supabase
      .from('affiliate_links')
      .select('*, marketplace_products(title, slug, retail_price, currency)')
      .eq('affiliate_id', affId)
      .order('total_earned', { ascending: false })

    const { data: sales } = await supabase
      .from('marketplace_sales')
      .select('*')
      .eq('affiliate_id', affId)
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json({ affiliate: aff, links: links || [], sales: sales || [] })
  }

  // ── Request payout ────────────────────────────────────────────────
  if (action === 'request_payout') {
    const { affiliateId, amount, paymentDetails } = body

    const { data: aff } = await supabase
      .from('marketplace_affiliates')
      .select('wallet_balance, pending_payout')
      .eq('id', affiliateId)
      .single()

    if (!aff) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if ((aff.wallet_balance || 0) < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    await supabase.from('affiliate_payouts').insert({
      affiliate_id: affiliateId,
      amount,
      payment_details: paymentDetails,
      status: 'pending',
      requested_at: new Date().toISOString(),
    })

    await supabase.from('marketplace_affiliates')
      .update({ wallet_balance: (aff.wallet_balance || 0) - amount })
      .eq('id', affiliateId)

    return NextResponse.json({ ok: true, message: 'Payout request submitted. Processed within 3 business days.' })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const email = searchParams.get('email')

  if (code) {
    const { data: aff } = await supabase
      .from('marketplace_affiliates')
      .select('id, full_name, is_z2b_member, wallet_balance, total_earned, affiliate_code')
      .eq('affiliate_code', code.toUpperCase())
      .single()
    return NextResponse.json({ affiliate: aff })
  }

  if (email) {
    const { data: aff } = await supabase
      .from('marketplace_affiliates')
      .select('id, affiliate_code, wallet_balance, total_earned')
      .eq('email', email.toLowerCase())
      .single()
    return NextResponse.json({ affiliate: aff })
  }

  return NextResponse.json({ error: 'Provide code or email' }, { status: 400 })
}
