import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const res = NextResponse.next()
  const { searchParams, hostname, pathname } = req.nextUrl

  // ── Marketplace subdomain routing ──────────────────────────
  const isMarketplaceSubdomain = hostname.startsWith('marketplace.')

  if (isMarketplaceSubdomain) {
    // Root → /marketplace
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/marketplace', req.url))
    }
    // /book-ecosystem → actual page
    if (pathname === '/book-ecosystem') {
      return NextResponse.rewrite(
        new URL('/marketplace/product/book-ecosystem', req.url)
      )
    }
    // /dashboard → marketplace dashboard
    if (pathname === '/dashboard') {
      return NextResponse.rewrite(
        new URL('/marketplace/dashboard', req.url)
      )
    }
    // /join → join page
    if (pathname === '/join') {
      return NextResponse.rewrite(
        new URL('/marketplace/join', req.url)
      )
    }
  }

  // ── Affiliate ref cookie (existing logic) ──────────────────
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
  matcher: ['/marketplace/:path*', '/p/:path*', '/book-ecosystem', '/dashboard', '/join'],
}