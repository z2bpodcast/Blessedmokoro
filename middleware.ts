// FILE: middleware.ts (root of project)
// Tracks affiliate ?ref= parameter across all marketplace pages
// Stores in cookie so it persists through the purchase flow

import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { searchParams, hostname } = req.nextUrl

  // Only track on marketplace subdomain or /marketplace path
  const isMarketplace = hostname.startsWith('marketplace.') || req.nextUrl.pathname.startsWith('/marketplace')
  if (!isMarketplace) return res

  // Read affiliate code from ?ref= param
  const ref = searchParams.get('ref')
  if (ref && ref.length >= 6 && ref.length <= 20) {
    // Store in cookie for 30 days
    res.cookies.set('z2b_affiliate_ref', ref.toUpperCase(), {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
      httpOnly: false, // readable by JS for attribution
    })

    // Track the click
    // Fire and forget — don't await
    fetch(`${req.nextUrl.origin}/api/affiliate/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref,
        product_slug: req.nextUrl.pathname.split('/p/')[1] || null,
        referrer: req.headers.get('referer') || null,
      }),
    }).catch(() => {})
  }

  return res
}

export const config = {
  matcher: [
    '/marketplace/:path*',
    '/p/:path*',
  ],
}
