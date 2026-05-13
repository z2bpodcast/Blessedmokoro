// ============================================================
// Z2B 4M V3 — IDEA IGNITION API ROUTE
// File: app/api/idea-ignition/route.ts
// Laws: Server-side only · Tier-gated · Hidden orchestration
// Actions: synthesise_self | synthesise_market |
//          save_selection | regenerate
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import { normaliseTier }             from '@/lib/v3/tier-config'
import { check4MAccess }             from '@/lib/v3/session-manager'
import {
  runSelfDiscovery,
  runMarketDiscovery,
  saveIgnitionLog,
  canRegenerate,
  type SecretFrameworkResponses,
  type SelfDiscoveryCategory,
  type WorkLifeSubCategory,
  type MarketParams,
  type IgnitionOpportunity,
} from '@/lib/v3/ignition-engine'

// ── AUTH HELPER ──────────────────────────────────────────────
async function getAuthUser(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return { user: null, error: 'No auth token' }
  const { data: { user }, error } = await supabase.auth.getUser(token)
  return { user, error: error?.message ?? null }
}

// ── MAIN HANDLER ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    // Validate action
    const validActions = ['synthesise_self', 'synthesise_market', 'save_selection', 'regenerate']
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Authenticate
    const { user, error: authError } = await getAuthUser(req)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // Check 4M access (tier gate + BFM + expiry)
    const access = await check4MAccess(user.id)
    if (!access.allowed) {
      return NextResponse.json({
        error:    access.reason,
        redirect: access.redirect,
      }, { status: 403 })
    }

    // Get tier for this builder
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: profile } = await supabase
      .from('profiles')
      .select('paid_tier')
      .eq('id', user.id)
      .single() as { data: { paid_tier: string | null } | null }

    const tierId = normaliseTier(profile?.paid_tier || 'fam')

    // ── SYNTHESISE SELF DISCOVERY ─────────────────────────────
    if (action === 'synthesise_self') {
      const {
        category,
        sub_category,
        responses,
        geography,
      } = body as {
        category:     SelfDiscoveryCategory
        sub_category: WorkLifeSubCategory | undefined
        responses:    SecretFrameworkResponses
        geography?:   string
      }

      if (!category || !responses) {
        return NextResponse.json({ error: 'Missing category or responses' }, { status: 400 })
      }

      // Validate all SECRET responses are present
      const required: (keyof SecretFrameworkResponses)[] = [
        'problems', 'passions', 'skills', 'trends', 'transformations',
      ]
      const missing = required.filter(k => !responses[k]?.trim())
      if (missing.length > 0) {
        return NextResponse.json({
          error: 'Please answer all 5 questions before continuing',
        }, { status: 400 })
      }

      const result = await runSelfDiscovery({
        tierId:      tierId,
        category,
        subCategory: sub_category,
        responses,
        geography,
      })

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }

      // Save log (async — don't await, don't block response)
      saveIgnitionLog({
        builderId:          user.id,
        route:              'self',
        category:           category,
        subCategory:        sub_category,
        secretResponses:    responses,
        opportunitiesShown: result.opportunities,
      }).catch(console.error)

      return NextResponse.json({
        opportunities: stripHiddenScores(result.opportunities),
        route:         'self',
      })
    }

    // ── SYNTHESISE MARKET DISCOVERY ───────────────────────────
    if (action === 'synthesise_market') {
      const { params: marketParams } = body as { params: MarketParams }

      if (!marketParams?.geography || !marketParams?.category || !marketParams?.audience) {
        return NextResponse.json({ error: 'Missing market parameters' }, { status: 400 })
      }

      const result = await runMarketDiscovery({ tierId, params: marketParams })

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }

      // Save log async
      saveIgnitionLog({
        builderId:          user.id,
        route:              'market',
        marketParams,
        opportunitiesShown: result.opportunities,
      }).catch(console.error)

      return NextResponse.json({
        opportunities: stripHiddenScores(result.opportunities),
        route:         'market',
      })
    }

    // ── SAVE SELECTION ────────────────────────────────────────
    if (action === 'save_selection') {
      const { opportunity, log_id } = body as {
        opportunity: IgnitionOpportunity
        log_id?:     string
      }

      if (!opportunity?.id || !opportunity?.title) {
        return NextResponse.json({ error: 'Invalid opportunity data' }, { status: 400 })
      }

      // Update ignition log with selection
      if (log_id) {
        await (supabase.from as any)('idea_ignition_logs')
          .update({ selected_opp: stripHiddenScores([opportunity])[0] })
          .eq('id', log_id)
          .eq('builder_id', user.id)
      }

      return NextResponse.json({
        success:     true,
        opportunity: stripHiddenScores([opportunity])[0],
      })
    }

    // ── REGENERATE ────────────────────────────────────────────
    if (action === 'regenerate') {
      const { regen_count, route, category, sub_category, responses, params: marketParams } = body as {
        regen_count:  number
        route:        'self' | 'market'
        category?:    SelfDiscoveryCategory
        sub_category?:WorkLifeSubCategory
        responses?:   SecretFrameworkResponses
        params?:      MarketParams
      }

      if (!canRegenerate(regen_count)) {
        return NextResponse.json({
          error: 'Maximum regenerations reached. Please select from the options shown.',
        }, { status: 429 })
      }

      let result
      if (route === 'self' && category && responses) {
        result = await runSelfDiscovery({ tierId, category, subCategory: sub_category, responses })
      } else if (route === 'market' && marketParams) {
        result = await runMarketDiscovery({ tierId, params: marketParams })
      } else {
        return NextResponse.json({ error: 'Invalid regeneration parameters' }, { status: 400 })
      }

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }

      return NextResponse.json({
        opportunities: stripHiddenScores(result.opportunities),
        route,
        regen_count:   regen_count + 1,
      })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error'
    console.error('[idea-ignition]', msg)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

// ── STRIP HIDDEN SCORES ───────────────────────────────────────
// Law 11: Orchestration hidden from users
// Internal scores (_score, _pmfScore, _viralScore) NEVER leave the server
function stripHiddenScores(opps: IgnitionOpportunity[]): Omit<IgnitionOpportunity, '_score' | '_pmfScore' | '_viralScore'>[] {
  return opps.map(({ _score, _pmfScore, _viralScore, ...safe }) => safe)
}
