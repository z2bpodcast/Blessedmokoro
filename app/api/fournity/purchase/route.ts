import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `FOUR-${timestamp}-${random}`
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('fournity_sales_counter')
      .select('*')
      .single()
    if (error) throw error
    const currentPrice = data.launch_copies_remaining > 0 ? data.launch_price_cents : data.standard_price_cents
    return NextResponse.json({
      currentPrice,
      launchPrice: data.launch_price_cents,
      standardPrice: data.standard_price_cents,
      launchCopiesRemaining: data.launch_copies_remaining,
      totalSold: data.total_copies_sold,
      isLaunchPrice: data.launch_copies_remaining > 0
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get pricing' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { buyerName, buyerEmail, buyerWhatsapp, deliveryAddress, deliverySuburb, deliveryCity, deliveryPostalCode, deliveryProvince, referralCode, paymentReference, paymentStatus } = body
    if (!buyerName || !buyerEmail || !paymentReference) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const { data: counter, error: counterError } = await supabase.from('fournity_sales_counter').select('*').single()
    if (counterError) throw counterError
    const isLaunchPrice = counter.launch_copies_remaining > 0
    const amountPaid = isLaunchPrice ? counter.launch_price_cents : counter.standard_price_cents
    const commissionAmount = Math.round(amountPaid * 0.20)
    let referrerMemberId = null
    if (referralCode) {
      const { data: member } = await supabase.from('profiles').select('id').eq('referral_code', referralCode.toUpperCase()).single()
      if (member) referrerMemberId = member.id
    }
    const orderNumber = generateOrderNumber()
    const { error: orderError } = await supabase.from('fournity_orders').insert({
      order_number: orderNumber,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_whatsapp: buyerWhatsapp,
      delivery_address: deliveryAddress,
      delivery_suburb: deliverySuburb,
      delivery_city: deliveryCity,
      delivery_postal_code: deliveryPostalCode,
      delivery_province: deliveryProvince,
      amount_paid_cents: amountPaid,
      is_launch_price: isLaunchPrice,
      payment_reference: paymentReference,
      payment_status: paymentStatus || 'completed',
      referral_code: referralCode,
      referrer_member_id: referrerMemberId,
      commission_cents: referrerMemberId ? commissionAmount : null,
      commission_status: referrerMemberId ? 'pending' : null,
    })
    if (orderError) throw orderError
    await supabase.rpc('increment_fournity_sales')
    if (referrerMemberId && commissionAmount > 0) {
      await supabase.from('member_commissions').insert({
        member_id: referrerMemberId,
        product_name: 'FOURNITY',
        order_number: orderNumber,
        sale_amount: amountPaid,
        commission_amount: commissionAmount,
        commission_percent: 20,
        status: 'pending',
        buyer_email: buyerEmail
      })
    }
    await fetch('https://formspree.io/f/xvznekyo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: `FOURNITY ORDER ${orderNumber}`,
        Name: buyerName, Email: buyerEmail, WhatsApp: buyerWhatsapp,
        Amount: `R${amountPaid/100}`, LaunchPrice: isLaunchPrice ? 'YES' : 'NO',
        Address: `${deliveryAddress}, ${deliverySuburb}, ${deliveryCity}, ${deliveryPostalCode}, ${deliveryProvince}`,
        PaymentRef: paymentReference, Referral: referralCode || 'Direct',
        Date: new Date().toLocaleString('en-ZA')
      })
    })
    return NextResponse.json({ success: true, orderNumber, amountPaid, isLaunchPrice })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Purchase failed' }, { status: 500 })
  }
}
