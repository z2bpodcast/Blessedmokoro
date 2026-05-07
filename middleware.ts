// ============================================================
// FILE 1: middleware.ts (update your existing middleware)
// Handles marketplace subdomain auth — same session as main app
// ============================================================

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session — works across both subdomains (same Supabase project)
  const { data: { session } } = await supabase.auth.getSession()

  const host = req.headers.get('host') || ''
  const isMarketplace = host.startsWith('marketplace.')
  const { pathname } = req.nextUrl

  // ── Marketplace subdomain root → /marketplace ──────────────
  if (isMarketplace && pathname === '/') {
    return NextResponse.redirect(new URL('/marketplace', req.url))
  }

  // ── Clean URL: /book-ecosystem → actual page ───────────────
  if (isMarketplace && pathname === '/book-ecosystem') {
    return NextResponse.rewrite(new URL('/marketplace/product/book-ecosystem', req.url))
  }

  // ── Protected marketplace routes need auth ─────────────────
  const protectedMarketplacePaths = [
    '/marketplace/dashboard',
    '/marketplace/my-links',
    '/marketplace/earnings',
    '/marketplace/list',
  ]

  if (isMarketplace && protectedMarketplacePaths.some(p => pathname.startsWith(p))) {
    if (!session) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      loginUrl.searchParams.set('from', 'marketplace')
      return NextResponse.redirect(loginUrl)
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}


// ============================================================
// FILE 2: app/api/auth/marketplace-signup/route.ts
// New affiliates sign up here — creates FAM profile automatically
// Same account works on main app immediately
// ============================================================

// import { NextRequest, NextResponse } from 'next/server'
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'

// export const dynamic = 'force-dynamic'

// export async function POST(req: NextRequest) {
//   const supabase = createRouteHandlerClient({ cookies })
//   const { email, password, fullName, referralCode } = await req.json()

//   if (!email || !password || !fullName) {
//     return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
//   }

//   // ── STEP 1: Create Supabase auth user ──────────────────────
//   const { data: authData, error: signUpError } = await supabase.auth.signUp({
//     email: email.toLowerCase().trim(),
//     password,
//     options: {
//       data: { full_name: fullName },
//     },
//   })

//   if (signUpError) {
//     return NextResponse.json({ error: signUpError.message }, { status: 400 })
//   }

//   const userId = authData.user?.id
//   if (!userId) {
//     return NextResponse.json({ error: 'Sign up failed' }, { status: 500 })
//   }

//   // ── STEP 2: Generate referral code ─────────────────────────
//   const newRefCode = `${fullName.slice(0,3).toUpperCase().replace(/\s/g,'')}${Math.random().toString(36).slice(2,6).toUpperCase()}`

//   // ── STEP 3: Find referrer if ref code provided ─────────────
//   let sponsorId = null
//   if (referralCode) {
//     const { data: sponsor } = await supabase
//       .from('profiles')
//       .select('id')
//       .eq('referral_code', referralCode.toUpperCase())
//       .single()
//     sponsorId = sponsor?.id || null
//   }

//   // ── STEP 4: Create FAM profile ─────────────────────────────
//   // FAM = free tier — gets 4M first 3 features + workshop free content
//   // Same profile table as main app — one account everywhere
//   const { error: profileError } = await supabase
//     .from('profiles')
//     .upsert({
//       id: userId,
//       email: email.toLowerCase().trim(),
//       full_name: fullName,
//       user_role: 'fam',           // free tier
//       paid_tier: 'fam',
//       is_paid_member: false,
//       referral_code: newRefCode,
//       referred_by: sponsorId,     // who brought them in
//       sponsor_id: sponsorId,
//       joined_at: new Date().toISOString(),
//       joined_via: 'marketplace_affiliate', // track how they joined
//     })

//   if (profileError) {
//     return NextResponse.json({ error: profileError.message }, { status: 500 })
//   }

//   return NextResponse.json({
//     success: true,
//     userId,
//     referralCode: newRefCode,
//     message: 'Account created. You can now log in on both marketplace and the main Z2B platform.',
//   })
// }
