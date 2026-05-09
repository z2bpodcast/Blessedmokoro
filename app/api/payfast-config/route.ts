// app/api/payfast-config/route.ts
// Provides PayFast credentials to static HTML pages
// Credentials come from Vercel environment variables

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    merchant_id:  process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID  || '',
    merchant_key: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || '',
  })
}
