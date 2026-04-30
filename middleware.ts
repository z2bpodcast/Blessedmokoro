import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { searchParams, hostname } = req.nextUrl
  const isMarketplace = hostname.startsWith('marketplace.') || req.nextUrl.pathname.startsWith('/marketplace')
  if (!isMarketplace) return res
  const ref = searchParams.get('ref')
  if (ref && ref.length >= 6 && ref.length <= 20) {
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
