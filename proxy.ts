// FILE: proxy.ts
// Affiliate ref tracking — stores ?ref= in cookie for 30 days
// Uses "proxy" export as required by Next.js 15+

import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const res = NextResponse.next()
  const { searchParams, hostname, pathname } = req.nextUrl
  const isMarketplace =
    hostname.startsWith('marketplace.') ||
    pathname.startsWith('/marketplace') ||
    pathname.startsWith('/p/')
  if (!isMarketplace) return res
  const ref = searchParams.get('ref')
  if (ref && ref.length >= 6 && ref.length <= 20 && /^[A-Z0-9]+$/i.test(ref)) {
    res.cookies.set('z2b_affiliate_ref', ref.toUpperCase(), {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
    })
  }
  return res
}

export const config = {
  matcher: ['/marketplace/:path*', '/p/:path*'],
}
