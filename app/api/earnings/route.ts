// ============================================================
// Z2B 4M V3 — EARNINGS API
// File: app/api/earnings/route.ts
// Laws: Reads commissions table · Calculates QPB eligibility
//       Tier progression · ISP / TSC / TLI breakdown
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import { normaliseTier, getTier }    from '@/lib/v3/tier-config'

// ── COMP PLAN CONSTANTS ───────────────────────────────────────
const ISP_RATES: Record<string, number> = {
  starter:         0.20,  // 20%
  bronze:          0.25,  // 25%
  copper:          0.30,  // 30%
  silver:          0.35,  // 35%
  gold:            0.40,  // 40%
  platinum:        0.45,  // 45%
  rocket_gold:     0.45,
  rocket_platinum: 0.50,  // 50%
  fam:             0.00,
  free:            0.00,
}

const QPB_RATE       = 0.075  // 7.5% on Copper / 10% on Silver+
const QPB_RATE_HIGH  = 0.10
const QPB_MIN_SALES  = 3      // 3 unique-tier sales in a month

const TIER_ORDER = ['fam','starter','bronze','copper','silver','gold','platinum','rocket_gold','rocket_platinum']
const TIER_PRICES: Record<string, number> = {
  starter: 500, bronze: 2500, copper: 5000,
  silver: 12000, gold: 25000, platinum: 50000,
}

function getNextTier(tierId: string): string | null {
  const idx = TIER_ORDER.indexOf(tierId)
  if (idx < 0 || idx >= TIER_ORDER.length - 1) return null
  return TIER_ORDER[idx + 1] ?? null
}

// ── AUTH HELPER ───────────────────────────────────────────────

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

// ── GET EARNINGS ──────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { user, sb } = await getUser(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const now       = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

  // Load profile for tier
  const { data: profile } = await (sb.from('profiles') as any)
    .select('paid_tier, full_name, referral_code')
    .eq('id', user.id)
    .maybeSingle() as { data: any }

  const tierId  = normaliseTier(profile?.paid_tier ?? 'fam')
  const tierDef = getTier(tierId)

  // Load ALL commissions for this builder
  const { data: commissions } = await (sb.from as any)('commissions')
    .select('id, type, amount, source_tier, created_at, status, note')
    .eq('member_id', user.id)
    .order('created_at', { ascending: false })
    .limit(200) as { data: any[] | null }

  const allComms = commissions ?? []

  // ── ISP: Individual Sales Profit ──────────────────────────
  const ispComms     = allComms.filter(c => c.type === 'isp')
  const ispTotal     = ispComms.reduce((s, c) => s + (c.amount ?? 0), 0)
  const ispThisMonth = ispComms
    .filter(c => c.created_at >= monthStart)
    .reduce((s, c) => s + (c.amount ?? 0), 0)
  const ispRate      = ISP_RATES[tierId] ?? 0

  // ── TSC: Team Sales Commission ─────────────────────────────
  const tscComms     = allComms.filter(c => c.type === 'tsc')
  const tscTotal     = tscComms.reduce((s, c) => s + (c.amount ?? 0), 0)
  const tscThisMonth = tscComms
    .filter(c => c.created_at >= monthStart)
    .reduce((s, c) => s + (c.amount ?? 0), 0)

  // ── QPB: Qualified Performance Bonus ──────────────────────
  // Requires 3 sales from different tiers in a month
  const ispThisMonthComms = ispComms.filter(c => c.created_at >= monthStart)
  const uniqueTiersThisMonth = new Set(ispThisMonthComms.map(c => c.source_tier).filter(Boolean))
  const qpbSalesCount   = uniqueTiersThisMonth.size
  const qpbEligible     = qpbSalesCount >= QPB_MIN_SALES
  const qpbRate         = tierId === 'copper' ? QPB_RATE : QPB_RATE_HIGH

  const qpbComms        = allComms.filter(c => c.type === 'qpb')
  const qpbTotal        = qpbComms.reduce((s, c) => s + (c.amount ?? 0), 0)
  const qpbThisMonth    = qpbComms
    .filter(c => c.created_at >= monthStart)
    .reduce((s, c) => s + (c.amount ?? 0), 0)

  // Estimated QPB if eligible this month
  const qpbEstimate = qpbEligible
    ? ispThisMonth * qpbRate
    : 0

  // ── TLI: Team Leadership Incentive ────────────────────────
  const tliComms  = allComms.filter(c => c.type === 'tli')
  const tliTotal  = tliComms.reduce((s, c) => s + (c.amount ?? 0), 0)

  // ── TOTAL EARNINGS ─────────────────────────────────────────
  const grandTotal      = ispTotal + tscTotal + qpbTotal + tliTotal
  const grandThisMonth  = ispThisMonth + tscThisMonth + qpbThisMonth

  // ── TIER PROGRESSION ──────────────────────────────────────
  const nextTierId    = getNextTier(tierId)
  const nextTierPrice = nextTierId ? (TIER_PRICES[nextTierId] ?? null) : null
  const nextTierDef   = nextTierId ? getTier(nextTierId) : null

  // ISP needed to fund next tier upgrade
  const ispToNextTier = nextTierPrice
    ? Math.max(0, nextTierPrice - ispTotal)
    : null

  // ── RECENT TRANSACTIONS ────────────────────────────────────
  const recentTx = allComms.slice(0, 20).map(c => ({
    id:        c.id,
    type:      c.type?.toUpperCase() ?? 'COMMISSION',
    amount:    c.amount ?? 0,
    note:      c.note ?? '',
    date:      c.created_at,
    status:    c.status ?? 'paid',
  }))

  return NextResponse.json({
    // Member info
    tierId,
    tierLabel:    tierDef.label,
    firstName:    profile?.full_name?.split(' ')[0] ?? '',
    referralCode: profile?.referral_code ?? '',
    ispRate:      Math.round(ispRate * 100),

    // ISP
    ispTotal,
    ispThisMonth,

    // TSC
    tscTotal,
    tscThisMonth,

    // QPB
    qpbTotal,
    qpbThisMonth,
    qpbSalesCount,
    qpbEligible,
    qpbEstimate,
    qpbMinSales:  QPB_MIN_SALES,

    // TLI
    tliTotal,

    // Totals
    grandTotal,
    grandThisMonth,

    // Tier progression
    nextTierId:       nextTierId ?? null,
    nextTierLabel:    nextTierDef?.label ?? null,
    nextTierPrice:    nextTierPrice ?? null,
    ispToNextTier:    ispToNextTier ?? null,

    // Recent
    recentTx,

    // Meta
    asOf: new Date().toISOString(),
  })
}
