// ============================================================
// Z2B 4M V3 — EARNINGS API (CORRECTED)
// File: app/api/earnings/route.ts
// CORRECTED: ISP 10-30% on membership · Affiliate 20% on marketplace
// NSB = seasonal CEO Competition (not a permanent stream)
// Engine types: manual · automatic · electric · rocket
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import { normaliseTier, getTier }    from '@/lib/v3/tier-config'

// ── ISP RATES — membership tier sales only ────────────────────
// Source: live compensation page NSB table (derived from R100 + ISP% of R500)
const ISP_RATES: Record<string, number> = {
  fam:      0.00,   // FAM earns NSB only — no ISP
  free:     0.00,
  starter:  0.10,   // 10%
  bronze:   0.18,   // 18%
  copper:   0.22,   // 22%
  silver:   0.25,   // 25%
  gold:     0.28,   // 28%
  platinum: 0.30,   // 30%
}

// ── AFFILIATE COMMISSION RATE — marketplace sales only ────────
const AFFILIATE_RATE = 0.20  // 20% flat — all tiers including FAM

// ── QPB THRESHOLDS ────────────────────────────────────────────
const QPB_RATE       = 0.075   // 7.5% — Copper
const QPB_RATE_HIGH  = 0.10    // 10%  — Silver+
const QPB_MIN_SALES  = 3       // 3 unique-tier sales in a month

// ── ENGINE TYPES ──────────────────────────────────────────────
const ENGINE_TYPES: Record<string, string> = {
  fam: 'manual', free: 'manual', starter: 'manual', bronze: 'manual',
  copper: 'automatic', silver: 'electric', gold: 'rocket', platinum: 'rocket',
}
const ENGINE_ICONS: Record<string, string> = {
  manual: '🔧', automatic: '⚙️', electric: '⚡', rocket: '🚀',
}

// ── TIER PROGRESSION ──────────────────────────────────────────
const TIER_ORDER  = ['fam','starter','bronze','copper','silver','gold','platinum']
const TIER_PRICES: Record<string, number> = {
  starter: 500, bronze: 2500, copper: 5000,
  silver: 12000, gold: 25000, platinum: 50000,
}

function getNextTier(tierId: string): string | null {
  const idx = TIER_ORDER.indexOf(tierId)
  if (idx < 0 || idx >= TIER_ORDER.length - 1) return null
  return TIER_ORDER[idx + 1] ?? null
}

async function getUser(req: NextRequest) {
  const sb    = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return { user: null, sb }
  const { data: { user } } = await sb.auth.getUser(token)
  return { user, sb }
}

export async function GET(req: NextRequest) {
  const { user, sb } = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const now            = new Date()
  const monthStart     = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data: profile } = await (sb.from('profiles') as any)
    .select('paid_tier, full_name, referral_code, created_at')
    .eq('id', user.id)
    .maybeSingle() as { data: any }

  const tierId      = normaliseTier(profile?.paid_tier ?? 'fam')
  const tierDef     = getTier(tierId)
  const isFam       = tierId === 'fam' || tierId === 'free'
  const engineType  = ENGINE_TYPES[tierId] ?? 'manual'
  const engineIcon  = ENGINE_ICONS[engineType] ?? '🔧'
  const ispRate     = ISP_RATES[tierId] ?? 0

  const { data: commissions } = await (sb.from as any)('commissions')
    .select('id, type, amount, source_tier, created_at, status, note')
    .eq('member_id', user.id)
    .order('created_at', { ascending: false })
    .limit(200) as { data: any[] | null }

  const allComms = commissions ?? []

  // ── AFFILIATE COMMISSION — marketplace product sales ─────────
  const affComms        = allComms.filter(c => c.type === 'affiliate')
  const affTotal        = affComms.reduce((s, c) => s + (c.amount ?? 0), 0)
  const affThisMonth    = affComms
    .filter(c => c.created_at >= monthStart)
    .reduce((s, c) => s + (c.amount ?? 0), 0)

  // ── ISP — membership tier referral sales ─────────────────────
  // FAM earns 0 ISP — only affiliate commission
  const ispComms        = allComms.filter(c => c.type === 'isp')
  const ispTotal        = ispComms.reduce((s, c) => s + (c.amount ?? 0), 0)
  const ispThisMonth    = ispComms
    .filter(c => c.created_at >= monthStart)
    .reduce((s, c) => s + (c.amount ?? 0), 0)

  // ── TSC — team sales commission ───────────────────────────────
  const tscComms        = isFam ? [] : allComms.filter(c => c.type === 'tsc')
  const tscTotal        = tscComms.reduce((s, c) => s + (c.amount ?? 0), 0)
  const tscThisMonth    = tscComms
    .filter(c => c.created_at >= monthStart)
    .reduce((s, c) => s + (c.amount ?? 0), 0)

  // ── QPB — qualified performance bonus ─────────────────────────
  const ispThisMonthAll = ispComms.filter(c => c.created_at >= monthStart)
  const uniqueTiers     = new Set(ispThisMonthAll.map(c => c.source_tier).filter(Boolean))
  const qpbSalesCount   = uniqueTiers.size
  const qpbEligible     = !isFam && qpbSalesCount >= QPB_MIN_SALES
  const qpbRate         = tierId === 'copper' ? QPB_RATE : QPB_RATE_HIGH
  const qpbComms        = isFam ? [] : allComms.filter(c => c.type === 'qpb')
  const qpbTotal        = qpbComms.reduce((s, c) => s + (c.amount ?? 0), 0)
  const qpbThisMonth    = qpbComms
    .filter(c => c.created_at >= monthStart)
    .reduce((s, c) => s + (c.amount ?? 0), 0)
  const qpbEstimate     = qpbEligible ? ispThisMonth * qpbRate : 0

  // ── TLI — team leadership incentive ──────────────────────────
  const tliComms        = isFam ? [] : allComms.filter(c => c.type === 'tli')
  const tliTotal        = tliComms.reduce((s, c) => s + (c.amount ?? 0), 0)

  // ── CEO COMPETITIONS (seasonal NSB) ──────────────────────────
  const nsbComms        = allComms.filter(c => c.type === 'nsb')
  const nsbTotal        = nsbComms.reduce((s, c) => s + (c.amount ?? 0), 0)

  // ── TOTALS ────────────────────────────────────────────────────
  const grandTotal      = affTotal + ispTotal + tscTotal + qpbTotal + tliTotal + nsbTotal
  const grandThisMonth  = affThisMonth + ispThisMonth + tscThisMonth + qpbThisMonth

  // ── TIER PROGRESSION ──────────────────────────────────────────
  const nextTierId    = getNextTier(tierId)
  const nextTierPrice = nextTierId ? (TIER_PRICES[nextTierId] ?? null) : null
  const nextTierDef   = nextTierId ? getTier(nextTierId) : null
  const ispToNextTier = nextTierPrice ? Math.max(0, nextTierPrice - ispTotal) : null

  // ── FAM AUTO-UPGRADE TRACKER ──────────────────────────────────
  // FAM: first R500 NSB accumulated → auto-upgrade to Starter
  const famJoinDate        = profile?.created_at ? new Date(profile.created_at) : null
  const famDaysActive      = famJoinDate ? Math.floor((Date.now() - famJoinDate.getTime()) / 86400000) : 0
  const famIn90Days        = isFam && famDaysActive <= 90
  const famNsbTotal        = isFam ? nsbTotal : null
  const famDaysRemaining   = isFam && famIn90Days ? Math.max(0, 90 - famDaysActive) : 0
  const famUpgradeProgress = isFam
    ? (famIn90Days ? Math.min(100, Math.round((nsbTotal / 700) * 100)) : null)
    : null

  return NextResponse.json({
    // Member
    tierId, tierLabel: tierDef.label,
    firstName:    profile?.full_name?.split(' ')[0] ?? '',
    referralCode: profile?.referral_code ?? '',
    isFam,
    engineType, engineIcon,
    ispRate: Math.round(ispRate * 100),
    affiliateRate: Math.round(AFFILIATE_RATE * 100),

    // Affiliate (marketplace — ALL tiers)
    affTotal, affThisMonth,

    // ISP (membership — Starter+ only)
    ispTotal, ispThisMonth,

    // TSC
    tscTotal, tscThisMonth,

    // QPB
    qpbTotal, qpbThisMonth,
    qpbSalesCount, qpbEligible, qpbEstimate, qpbMinSales: QPB_MIN_SALES,

    // TLI
    tliTotal,

    // CEO Competitions (seasonal NSB)
    nsbTotal,

    // Totals
    grandTotal, grandThisMonth,

    // Progression
    nextTierId: nextTierId ?? null,
    nextTierLabel: nextTierDef?.label ?? null,
    nextTierPrice: nextTierPrice ?? null,
    ispToNextTier: ispToNextTier ?? null,

    // FAM specific
    famNsbTotal,
    famUpgradeProgress,
    famIn90Days,
    famDaysRemaining,

    // Recent transactions
    recentTx: allComms.slice(0, 20).map(c => ({
      id: c.id, type: c.type?.toUpperCase() ?? 'COMMISSION',
      amount: c.amount ?? 0, note: c.note ?? '',
      date: c.created_at, status: c.status ?? 'paid',
    })),

    asOf: new Date().toISOString(),
  })
}
