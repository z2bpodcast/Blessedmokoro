// ============================================================
// Z2B V3 — GOOGLE TRENDS + OPPORTUNITY SYNTHESIS API
// File: app/api/trends/route.ts
// Flow: Fetch real Google Trends → GPT-4o synthesises into
//       product opportunities with demand evidence
// Zero builder input required — 4M does the discovery
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'

// ── GEO CODE MAP ──────────────────────────────────────────────
const GEO_CODES: Record<string, string> = {
  // Africa
  'South Africa': 'ZA', 'Nigeria': 'NG', 'Kenya': 'KE', 'Ghana': 'GH',
  'Egypt': 'EG', 'Ethiopia': 'ET', 'Tanzania': 'TZ', 'Uganda': 'UG',
  'Rwanda': 'RW', 'Botswana': 'BW', 'Zimbabwe': 'ZW', 'Zambia': 'ZM',
  'Senegal': 'SN', 'Mozambique': 'MZ',
  // Asia
  'India': 'IN', 'China': 'CN', 'Japan': 'JP', 'South Korea': 'KR',
  'Indonesia': 'ID', 'Philippines': 'PH', 'Vietnam': 'VN', 'Thailand': 'TH',
  'Malaysia': 'MY', 'Singapore': 'SG', 'Bangladesh': 'BD', 'Pakistan': 'PK',
  'Sri Lanka': 'LK',
  // Europe
  'United Kingdom': 'GB', 'Germany': 'DE', 'France': 'FR', 'Netherlands': 'NL',
  'Spain': 'ES', 'Italy': 'IT', 'Poland': 'PL', 'Sweden': 'SE',
  'Norway': 'NO', 'Denmark': 'DK', 'Switzerland': 'CH', 'Belgium': 'BE',
  'Portugal': 'PT', 'Ireland': 'IE',
  // Americas
  'United States': 'US', 'Canada': 'CA', 'Mexico': 'MX',
  'Brazil': 'BR', 'Argentina': 'AR', 'Colombia': 'CO', 'Chile': 'CL',
  // Oceania
  'Australia': 'AU', 'New Zealand': 'NZ',
  // Middle East
  'UAE': 'AE', 'Saudi Arabia': 'SA', 'Qatar': 'QA', 'Kuwait': 'KW',
}

const CATEGORY_MAP: Record<string, number> = {
  'Business & Finance': 7, 'Education': 958, 'Health': 45,
  'Self Improvement': 69, 'Technology': 5, 'Careers': 60,
}

async function getUser(req: NextRequest) {
  const sb    = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return { user: null }
  const { data: { user } } = await sb.auth.getUser(token)
  return { user }
}

// ── FETCH GOOGLE TRENDS ───────────────────────────────────────

async function fetchDailyTrends(geo: string): Promise<string[]> {
  try {
    const url = `https://trends.google.com/trends/api/dailytrends?hl=en-US&tz=0&geo=${geo}&ns=15`
    const res  = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Z2B/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const raw  = await res.text()
    // Google wraps response in ")]}',\n" — strip it
    const json = raw.replace(/^\)\]\}',\n/, '')
    const data = JSON.parse(json)
    const trendingSearches = data?.default?.trendingSearchesDays?.[0]?.trendingSearches ?? []
    return trendingSearches.slice(0, 20).map((t: any) => t.title?.query ?? '').filter(Boolean)
  } catch (_) {
    return []
  }
}

async function fetchRisingTrends(geo: string, category: number): Promise<{ query: string; value: number }[]> {
  try {
    const url = `https://trends.google.com/trends/api/explore?hl=en-US&tz=0&req=${encodeURIComponent(JSON.stringify({ comparisonItem: [{ geo, time: 'today 3-m', category }], property: '', userConfig: { userType: 'USER_TYPE_LEGIT_USER' } }))}`
    const res  = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Z2B/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const raw  = await res.text()
    const json = raw.replace(/^\)\]\}',\n/, '')
    const data = JSON.parse(json)
    const rising = data?.widgets?.find((w: any) => w.id === 'RISING_QUERIES')?.request?.restriction?.complexKeywordsRestriction?.keyword ?? []
    return rising.slice(0, 10).map((k: any) => ({ query: k.value, value: 100 }))
  } catch (_) {
    return []
  }
}

// ── SYNTHESISE OPPORTUNITIES ──────────────────────────────────

async function synthesiseOpportunities(params: {
  trends:      string[]
  rising:      { query: string; value: number }[]
  market:      any
  demographic: string
  themeInput?: string
  source?: string
}): Promise<Record<string,unknown>> {
  const trendList    = params.trends.slice(0, 15).join(', ')
  const risingList   = params.rising.slice(0, 8).map(r => r.query).join(', ')
  const marketLabel  = params.market?.label ?? 'Global'
  const currency     = params.market?.currency ?? 'USD ($)'
  const demographic  = params.demographic || 'general audience'

  const prompt = `You are the Z2B 4M Machine intelligence engine — the world's smartest digital product strategist.

LIVE MARKET DATA (just fetched from Google Trends for ${marketLabel}):
Currently trending: ${trendList || 'not available — use your knowledge of this market'}
Rising fast (demand gaps): ${risingList || 'not available'}

TARGET MARKET: ${marketLabel}
TARGET DEMOGRAPHIC: ${demographic}
BUILDER FOCUS: ${params.themeInput ? "The builder specifically wants products related to: " + params.themeInput + ". All 8 opportunities MUST be relevant to this theme." : "Find the best opportunities in this market."}
CURRENCY: ${currency}

YOUR TASK:
Analyse these real trend signals and identify 8 digital product opportunities where:
1. Real demand exists RIGHT NOW (evidenced by the trends above)
2. The product solves a specific pain point for the target demographic
3. The format is practical and quick to build (ebook, toolkit, template, checklist, workbook, course, masterclass)
4. The price is realistic for this market

Be the genius in the room. Surface opportunities the builder never thought about.
Connect the dots between what people are searching for and what they would pay to solve.
A trend about "AI at work" might mean "The Employed Person's AI Toolkit for [Country] Professionals."
A trend about "load shedding" in South Africa becomes "The Home Business Continuity Playbook."
A trend about "quiet quitting" becomes "The Corporate Exit Strategy Digital Course."

Think laterally. Think like a market. Think like the buyer, not the builder.

Respond ONLY with valid JSON:
{
  "marketSignal": "One sentence describing what the trends reveal about this market right now",
  "opportunities": [
    {
      "id": "tr1",
      "title": "Specific, compelling product title",
      "category": "Category",
      "audience": "Very specific audience description",
      "problemSolved": "The exact problem this solves — phrased as the buyer would think it",
      "format": "ebook|toolkit|template|checklist|workbook|course|masterclass",
      "priceRangeMin": 9,
      "priceRangeMax": 97,
      "currency": "${currency}",
      "difficulty": "beginner|intermediate|advanced",
      "trendEvidence": "The specific trend or rising query that signals demand for this",
      "whyNow": "Why this moment is the right time — urgency and timing",
      "demandLevel": "rising|high|very_high"
    }
  ]
}`

  const res  = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 3000,
      temperature: 0.85,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    }),
  })
  const data   = await res.json()
  const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? '{}')
  return parsed
}

// ── POST HANDLER ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { user } = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { market, themeInput, selfAnswers, scriptContent, source } = await req.json()

  // Tier check — Starter gets AI fallback, Bronze+ gets live Google Trends
  const sb2 = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data: profile } = await (sb2.from as any)('profiles').select('paid_tier').eq('id', user.id).maybeSingle() as { data: any }
  const { normaliseTier } = await import('@/lib/v3/tier-config')
  const userTier = normaliseTier(profile?.paid_tier ?? 'starter')
  const hasLiveTrends = !['fam', 'free', 'starter'].includes(userTier)

  // Determine geo code
  const geo      = GEO_CODES[market?.country ?? ''] ?? 'US'
  const demo     = market?.demographic ?? ''

  // Fetch trends — Bronze+ gets live Google Trends, Starter gets AI-only
  const [daily, risingBiz, risingEdu] = hasLiveTrends
    ? await Promise.all([
        fetchDailyTrends(geo),
        fetchRisingTrends(geo, CATEGORY_MAP['Business & Finance']),
        fetchRisingTrends(geo, CATEGORY_MAP['Self Improvement']),
      ])
    : [[], [], []]

  const rising = [...risingBiz, ...risingEdu]
  const hasTrends = daily.length > 0 || rising.length > 0

  // Synthesise with GPT-4o
  try {
    const result = await synthesiseOpportunities({
      trends:      daily,
      rising,
      market,
      demographic: demo,
      themeInput: themeInput ?? "",
      source: source ?? "choice",
    })

    return NextResponse.json({
      opportunities:  result.opportunities ?? [],
      marketSignal:   result.marketSignal ?? '',
      trendsUsed:     daily.slice(0, 5),
      risingUsed:     rising.slice(0, 5).map(r => r.query),
      liveData:       hasTrends && hasLiveTrends,
      aiOnly:         !hasLiveTrends,
      tierLabel:      hasLiveTrends ? 'Live Google Trends' : 'Z2B AI Intelligence',
      geo,
      marketLabel:    market?.label ?? 'Global',
    })
  } catch (e) {
    return NextResponse.json({ error: 'Could not analyse market. Please try again.' }, { status: 500 })
  }
}
