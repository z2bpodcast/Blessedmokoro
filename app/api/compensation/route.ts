// FILE: app/api/compensation/route.ts
// Z2B Compensation Engine — Server-side calculation
// Single source of truth. All rules enforced here.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

// ── LOCKED COMPENSATION CONSTANTS ────────────────────────────────────────────
// These match Supabase functions exactly. Any change here must be updated in SQL too.

const TIER_PRICES: Record<string,number> = {
  starter:500, bronze:2500, copper:5000, silver:12000,
  gold:24000, platinum:50000,
  silver_rocket:17000, gold_rocket:35000, platinum_rocket:70000,
}

const ISP_RATES: Record<string,number> = {
  // Free and Starter: NO ISP (0%)
  free:0, starter:0,
  // Bronze to Platinum Rocket: ISP earned on BFM + Bronze+ upgrades
  bronze:18, copper:22, silver:25, gold:28, platinum:30,
  silver_rocket:25, gold_rocket:28, platinum_rocket:30,
}

const BFM_AMOUNTS: Record<string,number> = {
  starter:850, bronze:1050, copper:1300, silver:2000, gold:3200, platinum:5800,
  // Rocket tiers: BFM = Business Fuel Maintenance (higher than standard equivalents)
  silver_rocket:2550, gold_rocket:5250, platinum_rocket:10500,
}

const TSC_GENERATIONS: Record<string,number> = {
  free:0, starter:0, bronze:3, copper:4, silver:6, silver_rocket:6,
  gold:8, gold_rocket:8, platinum:10, platinum_rocket:10,
}

const MARKETPLACE_BUILDER_CUT = 0.90  // 90%
const MARKETPLACE_Z2B_CUT     = 0.10  // 10%
const QPB_RATE                = 0.075 // +7.5%
const QPB_WINDOW_DAYS         = 90
const FREE_AUTO_UPGRADE_THRESHOLD = 500 // R500 NSB triggers Starter upgrade

// ── NSB CALCULATION ───────────────────────────────────────────────────────────
function calcNSB(builderTier: string, saleTier: string, salePrice: number): number {
  if (builderTier === 'free') {
    if (saleTier === 'starter') return 100           // R100 flat only
    return Math.round(0.05 * salePrice)              // 5% of tier price
  }
  const rate = ISP_RATES[builderTier] || 10
  if (saleTier === 'starter') {
    return Math.round(100 + (rate/100 * 500))        // R100 + ISP% of R500
  }
  return Math.round(rate/100 * salePrice)            // ISP% of tier price
}

// ── ISP on BFM ────────────────────────────────────────────────────────────────
function calcISPBFM(builderTier: string, memberTier: string): number {
  // Free and Starter earn NO ISP
  if (['free','starter'].includes(builderTier)) return 0
  const rate    = ISP_RATES[builderTier] || 0
  const bfm     = BFM_AMOUNTS[memberTier] || 0
  return Math.round(rate/100 * bfm)
}

// ── ISP on Upgrade ────────────────────────────────────────────────────────────
function calcISPUpgrade(builderTier: string, saleTier: string, salePrice: number): number {
  if (['free','starter'].includes(builderTier)) return 0
  if (saleTier === 'starter') return 0
  const rate = ISP_RATES[builderTier] || 0
  return Math.round(rate/100 * salePrice)
}

// ── Marketplace split ─────────────────────────────────────────────────────────
function calcMarketplace(retailPrice: number) {
  return {
    builderCut: Math.round(retailPrice * MARKETPLACE_BUILDER_CUT),
    z2bCut:     Math.round(retailPrice * MARKETPLACE_Z2B_CUT),
  }
}

// ── QPB check ─────────────────────────────────────────────────────────────────
async function isQPBEligible(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('registered_at, created_at')
    .eq('id', userId)
    .single()
  if (!data) return false
  const regDate = new Date(data.registered_at || data.created_at)
  const cutoff  = new Date(regDate.getTime() + QPB_WINDOW_DAYS * 86400000)
  return new Date() < cutoff
}

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    // ── Calculate NSB ──────────────────────────────────────────────────────
    if (action === 'calc_nsb') {
      const { builderTier, saleTier } = body
      const price  = TIER_PRICES[saleTier] || 500
      const nsb    = calcNSB(builderTier, saleTier, price)
      const rate   = builderTier === 'free' && saleTier !== 'starter' ? 5 : ISP_RATES[builderTier] || 10
      return NextResponse.json({
        nsb,
        formula: builderTier === 'free'
          ? saleTier === 'starter'
            ? 'R100 flat (Free + Starter sale)'
            : `5% of R${price.toLocaleString()} = R${nsb}`
          : saleTier === 'starter'
            ? `R100 + ${rate}% of R500 = R${nsb}`
            : `${rate}% of R${price.toLocaleString()} = R${nsb}`,
      })
    }

    // ── Calculate full payout for a sale ───────────────────────────────────
    if (action === 'calc_payout') {
      const { userId, builderTier, saleTier, isPersonal = true } = body
      const price      = TIER_PRICES[saleTier] || 500
      const nsb        = isPersonal ? calcNSB(builderTier, saleTier, price) : 0
      const isp        = calcISPUpgrade(builderTier, saleTier, price)
      const base       = nsb + isp
      const qpbEligible = userId ? await isQPBEligible(userId) : false
      const qpbBonus   = qpbEligible ? Math.round(base * QPB_RATE) : 0
      const total      = base + qpbBonus

      return NextResponse.json({ nsb, isp, qpbBonus, qpbEligible, total,
        breakdown: `NSB:R${nsb} + ISP:R${isp} + QPB:R${qpbBonus} = R${total}` })
    }

    // ── Calculate ISP on BFM ───────────────────────────────────────────────
    if (action === 'calc_isp_bfm') {
      const { builderTier, memberTier } = body
      const bfm = BFM_AMOUNTS[memberTier] || 0
      const isp = calcISPBFM(builderTier, bfm)
      return NextResponse.json({ isp, bfm, rate: ISP_RATES[builderTier] || 0 })
    }

    // ── Calculate marketplace split ────────────────────────────────────────
    if (action === 'calc_marketplace') {
      const { retailPrice } = body
      return NextResponse.json(calcMarketplace(retailPrice))
    }

    // ── Get full NSB matrix ────────────────────────────────────────────────
    if (action === 'nsb_matrix') {
      const matrix: Record<string, Record<string,number>> = {}
      for (const builder of Object.keys(ISP_RATES)) {
        matrix[builder] = {}
        for (const [sale, price] of Object.entries(TIER_PRICES)) {
          matrix[builder][sale] = calcNSB(builder, sale, price)
        }
      }
      return NextResponse.json({ matrix, tierPrices: TIER_PRICES, ispRates: ISP_RATES })
    }

    // ── Process free builder NSB + auto-upgrade ────────────────────────────
    if (action === 'process_free_nsb') {
      const { userId, saleTier } = body
      const price = TIER_PRICES[saleTier] || 500
      const nsb   = calcNSB('free', saleTier, price)

      // Get current NSB total
      const { data: tracker } = await supabase
        .from('free_builder_nsb')
        .select('total_nsb_earned')
        .eq('builder_id', userId)
        .single()

      const current = tracker?.total_nsb_earned || 0
      const total   = current + nsb

      let autoUpgraded = false
      let payout = nsb

      if (current < FREE_AUTO_UPGRADE_THRESHOLD && total >= FREE_AUTO_UPGRADE_THRESHOLD) {
        // Auto-upgrade to Starter
        await supabase.from('profiles').update({ paid_tier: 'starter' }).eq('id', userId)
        await supabase.from('free_builder_nsb').upsert({
          builder_id: userId, total_nsb_earned: total,
          auto_upgrade_triggered: true, auto_upgrade_at: new Date().toISOString(),
        }, { onConflict: 'builder_id' })
        payout       = Math.max(0, total - FREE_AUTO_UPGRADE_THRESHOLD)
        autoUpgraded = true
      } else {
        await supabase.from('free_builder_nsb').upsert({
          builder_id: userId, total_nsb_earned: total,
        }, { onConflict: 'builder_id' })
      }

      return NextResponse.json({
        nsb, payout, autoUpgraded, totalAccumulated: total,
        remaining: Math.max(0, FREE_AUTO_UPGRADE_THRESHOLD - Math.min(total, FREE_AUTO_UPGRADE_THRESHOLD)),
        message: autoUpgraded
          ? `🎉 Upgraded to Starter! R${payout} paid out.`
          : `R${nsb} NSB earned. R${total}/R${FREE_AUTO_UPGRADE_THRESHOLD} toward Starter upgrade.`,
      })
    }

    // ── QPB check ──────────────────────────────────────────────────────────
    if (action === 'qpb_status') {
      const { userId } = body
      const eligible = await isQPBEligible(userId)
      const { data } = await supabase.from('profiles').select('registered_at,created_at').eq('id', userId).single()
      const regDate  = new Date(data?.registered_at || data?.created_at || Date.now())
      const expires  = new Date(regDate.getTime() + QPB_WINDOW_DAYS * 86400000)
      const daysLeft = Math.max(0, Math.ceil((expires.getTime() - Date.now()) / 86400000))
      return NextResponse.json({ eligible, daysLeft, expiresAt: expires.toISOString(), rate: QPB_RATE * 100 })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  } catch (e: any) {
    console.error('[Compensation] ERROR:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// ── GET: Full compensation summary ────────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    version: '3.0',
    nine_income_streams: {
      '1_NSB':  'New Sale Bonus — personal sales only. Free=R100/5%, Starter=R100+10%, Bronze+=R100+ISP% (Starter) or ISP% (Bronze+)',
      '2_ISP':  'Individual Sales Profit — Bronze to Platinum Rocket ONLY (18-30%). On BFM monthly + Bronze+ upgrades. Free/Starter=R0.',
      '3_QPB':  'Quick Performance Bonus — +7.5% on NSB+ISP. First 90 days from registration only.',
      '4_TSC':  'Team Sales Commission — same rate as ISP. Bronze:G2-G3, Copper:G2-G4, Silver:G2-G6, Gold:G2-G8, Platinum:G2-G10.',
      '5_TLI':  'Team Leadership Income — once per rank achieved (not recurring). L1:R3,000 to L10:R3,500,000. Silver+ only.',
      '6_CEO_Competition': 'CEO Competition Income — structured challenges, rules-based, announced by CEO.',
      '7_CEO_Awards':      'CEO Awards — discretionary, special achievement, CEO decides.',
      '8_Marketplace':     'Marketplace Income — builder keeps 90%, Z2B takes 10%. Starter and above.',
      '9_Distribution':    'Distribution Rights — Platinum and Platinum Rocket only.',
    },
    rules: {
      nsb: {
        free_starter_sale:    'R100 flat only (no %)',
        free_bronze_plus:     '5% of tier price',
        starter_starter_sale: 'R100 + 10% of R500 = R150',
        starter_bronze_plus:  '10% of tier price',
        bronze_plus_starter:  'R100 + ISP% of R500',
        bronze_plus_upgrade:  'ISP% of tier price',
      },
      isp: {
        note:      'Bronze to Platinum Rocket ONLY. Free/Starter earn R0 ISP.',
        rates:     ISP_RATES,
        on:        ['BFM monthly payments (60-day activation)', 'Bronze+ tier upgrade purchases'],
      },
      bfm: {
        note:    'Business Fuel Maintenance — monthly fee, activates 60 days after purchase',
        amounts: BFM_AMOUNTS,
      },
      tsc_generations: TSC_GENERATIONS,
      marketplace:     { builder: '90%', z2b: '10%', available_from: 'starter' },
      qpb:             { rate: '7.5%', window: '90 days from registration' },
      tli:             { type: 'once per rank achieved', evaluated: 'quarterly', levels: 10, max_payout: 'R3,500,000' },
      free_auto_upgrade: { threshold: 'R500 NSB accumulated → auto Starter upgrade' },
      distribution_rights: { available_to: ['platinum', 'platinum_rocket'] },
    },
    tier_prices:  TIER_PRICES,
  })
}
