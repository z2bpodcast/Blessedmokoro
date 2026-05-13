// ============================================================
// Z2B 4M V3 — IDEA IGNITION ENGINE
// File: lib/v3/ignition-engine.ts
// Laws: Hidden orchestration · Tier-gated · Modular · Extensible
// Purpose: Core logic for both Self Discovery and Market
//          Discovery routes. All AI calls routed through
//          orchestration-router. Builder never sees internals.
// ============================================================

import { orchestrate, parseAIJson } from '@/lib/v3/orchestration-router'
import {
  getTier,
  normaliseTier,
  IGNITION_DEPTH_CONFIG,
  isUnlimitedOpportunities,
} from '@/lib/v3/tier-config'
import { createClient } from '@supabase/supabase-js'
import { randomUUID }    from 'crypto'

// ── TYPES ────────────────────────────────────────────────────

export type SelfDiscoveryCategory =
  | 'education'
  | 'work_life'
  | 'gifts_talents'
  | 'calling_purpose'
  | 'successes'
  | 'other'

export type WorkLifeSubCategory =
  | 'jobs'
  | 'business'
  | 'parenting'
  | 'farming'
  | 'ministry'
  | 'failures'
  | 'successes'
  | 'other'

export type MarketGeography =
  | 'south_africa'
  | 'nigeria'
  | 'kenya'
  | 'ghana'
  | 'zimbabwe'
  | 'uk'
  | 'usa'
  | 'global'
  | 'other'

export type MarketCategory =
  | 'business_finance'
  | 'education_learning'
  | 'health_wellness'
  | 'parenting'
  | 'career'
  | 'food_cooking'
  | 'faith'
  | 'technology'
  | 'beauty'
  | 'sports_fitness'
  | 'other'

export type MarketAudience =
  | 'employees'
  | 'entrepreneurs'
  | 'parents'
  | 'students'
  | 'women_25_45'
  | 'men_25_45'
  | 'youth_18_25'
  | 'seniors'
  | 'general_adults'

export interface SecretFrameworkResponses {
  problems:        string
  passions:        string
  skills:          string
  trends:          string
  transformations: string
}

export interface MarketParams {
  geography: MarketGeography
  category:  MarketCategory
  audience:  MarketAudience
}

export interface IgnitionOpportunity {
  id:                string  // uuid generated client-side
  title:             string
  audience:          string  // specific person description
  transformation:    string  // before → after
  format:            string  // eBook / Course / Template / etc.
  priceRangeMin:     number  // ZAR
  priceRangeMax:     number  // ZAR
  demandLevel:       'low' | 'medium' | 'high' | 'very_high'
  gapType:           string | null  // null if no gap detected
  // Scores are NEVER sent to the frontend
  _score?:           number  // hidden
  _pmfScore?:        number  // hidden
  _viralScore?:      number  // hidden
}

export interface IgnitionResult {
  opportunities: IgnitionOpportunity[]
  route:         'self' | 'market'
  tokensUsed:    number
  error:         string | null
}

// ── CATEGORY LABELS ──────────────────────────────────────────
// Used in prompts and UI — single source of truth

export const SELF_DISCOVERY_CATEGORIES: Record<SelfDiscoveryCategory, {
  label:       string
  emoji:       string
  description: string
  hasSubCats:  boolean
}> = {
  education: {
    label:       'Formal & Informal Education',
    emoji:       '🎓',
    description: 'Degrees, courses, training, certifications you hold',
    hasSubCats:  false,
  },
  work_life: {
    label:       'Work & Life Experience',
    emoji:       '💼',
    description: 'Jobs, businesses, relationships, struggles you have navigated',
    hasSubCats:  true,
  },
  gifts_talents: {
    label:       'Gifts & Talents',
    emoji:       '🎁',
    description: 'Natural abilities others notice and admire in you',
    hasSubCats:  false,
  },
  calling_purpose: {
    label:       'Calling & Purpose',
    emoji:       '🔥',
    description: 'What you feel deeply driven to do or change in the world',
    hasSubCats:  false,
  },
  successes: {
    label:       'Successes & Achievements',
    emoji:       '🏆',
    description: 'Results you have produced that others would want to replicate',
    hasSubCats:  false,
  },
  other: {
    label:       'Other',
    emoji:       '🌍',
    description: 'Something unique that does not fit the categories above',
    hasSubCats:  false,
  },
}

export const WORK_LIFE_SUBCATEGORIES: Record<WorkLifeSubCategory, string> = {
  jobs:       'Employment & Career',
  business:   'Business Ownership',
  parenting:  'Parenting & Family',
  farming:    'Agriculture & Farming',
  ministry:   'Ministry & Faith Work',
  failures:   'Failures I Overcame',
  successes:  'Successes I Achieved',
  other:      'Other Life Experience',
}

export const MARKET_GEOGRAPHIES: Record<MarketGeography, string> = {
  south_africa: '🇿🇦 South Africa',
  nigeria:      '🇳🇬 Nigeria',
  kenya:        '🇰🇪 Kenya',
  ghana:        '🇬🇭 Ghana',
  zimbabwe:     '🇿🇼 Zimbabwe',
  uk:           '🇬🇧 United Kingdom',
  usa:          '🇺🇸 United States',
  global:       '🌍 Global',
  other:        '🌐 Other',
}

export const MARKET_CATEGORIES: Record<MarketCategory, string> = {
  business_finance:    '💼 Business & Finance',
  education_learning:  '🎓 Education & Learning',
  health_wellness:     '💪 Health & Wellness',
  parenting:           '👨‍👩‍👧 Parenting',
  career:              '📈 Career Development',
  food_cooking:        '🍳 Food & Cooking',
  faith:               '✝️ Faith & Spirituality',
  technology:          '💻 Technology',
  beauty:              '💄 Beauty & Style',
  sports_fitness:      '⚽ Sports & Fitness',
  other:               '🌐 Other',
}

export const MARKET_AUDIENCES: Record<MarketAudience, string> = {
  employees:      '👔 Employed Adults',
  entrepreneurs:  '🚀 Entrepreneurs',
  parents:        '👨‍👩‍👧 Parents',
  students:       '🎓 Students',
  women_25_45:    '👩 Women 25-45',
  men_25_45:      '👨 Men 25-45',
  youth_18_25:    '🧑 Youth 18-25',
  seniors:        '👴 Seniors 55+',
  general_adults: '👥 General Adults',
}

// ── SECRET FRAMEWORK QUESTIONS ───────────────────────────────
// One question per step — shown one at a time in UI

export const SECRET_QUESTIONS: Record<
  keyof SecretFrameworkResponses,
  { question: string; placeholder: string; step: number }
> = {
  problems: {
    step:        1,
    question:    'What problems have you solved in your life that others around you still struggle with?',
    placeholder: 'e.g. I learned how to manage money on a small salary after years of debt...',
  },
  passions: {
    step:        2,
    question:    'What topic could you talk about for hours without getting bored or tired?',
    placeholder: 'e.g. I could talk all day about growing vegetables in small spaces...',
  },
  skills: {
    step:        3,
    question:    'What would people pay you to teach them how to do?',
    placeholder: 'e.g. People always ask me how I got promoted so quickly at work...',
  },
  trends: {
    step:        4,
    question:    'What is rising or changing around you that others are not yet taking advantage of?',
    placeholder: 'e.g. Everyone in my area is starting small food businesses since COVID...',
  },
  transformations: {
    step:        5,
    question:    'Who have you helped change their situation, and what exactly changed for them?',
    placeholder: 'e.g. I helped 3 colleagues get out of debt using a simple system I built...',
  },
}

// ── SELF DISCOVERY ENGINE ────────────────────────────────────

export async function runSelfDiscovery(params: {
  tierId:       string
  category:     SelfDiscoveryCategory
  subCategory?: WorkLifeSubCategory
  responses:    SecretFrameworkResponses
  builderName?: string
  geography?:   string
}): Promise<IgnitionResult> {
  const tier      = normaliseTier(params.tierId)
  const tierDef   = getTier(tier)
  const depthConf = IGNITION_DEPTH_CONFIG[tierDef.ideaIgnitionDepth]
  const maxOpps   = isUnlimitedOpportunities(depthConf.maxOpps)
    ? 5
    : depthConf.maxOpps

  const categoryLabel = SELF_DISCOVERY_CATEGORIES[params.category]?.label ?? params.category
  const subCatLabel   = params.subCategory
    ? WORK_LIFE_SUBCATEGORIES[params.subCategory]
    : ''
  const geo = params.geography ?? 'South Africa'

  const prompt = buildSelfDiscoveryPrompt({
    category:     categoryLabel,
    subCategory:  subCatLabel,
    responses:    params.responses,
    maxOpps,
    geo,
    depthLevel:   tierDef.ideaIgnitionDepth,
    hasGapAnalysis: depthConf.hasGapAnalysis,
  })

  const result = await orchestrate('opportunity_synthesis', prompt)

  if (result.error) {
    return { opportunities: [], route: 'self', tokensUsed: result.tokensUsed, error: result.error }
  }

  const { data, error: parseError } = parseAIJson<{ opportunities: RawOpportunity[] }>(result.content)

  if (parseError || !data?.opportunities) {
    return { opportunities: [], route: 'self', tokensUsed: result.tokensUsed, error: 'Could not parse opportunities' }
  }

  const scored = await scoreAndRankOpportunities(data.opportunities, tier, result.tokensUsed)
  return { ...scored, route: 'self' }
}

// ── MARKET DISCOVERY ENGINE ──────────────────────────────────

export async function runMarketDiscovery(params: {
  tierId:   string
  params:   MarketParams
}): Promise<IgnitionResult> {
  const tier      = normaliseTier(params.tierId)
  const tierDef   = getTier(tier)
  const depthConf = IGNITION_DEPTH_CONFIG[tierDef.ideaIgnitionDepth]
  const maxOpps   = isUnlimitedOpportunities(depthConf.maxOpps)
    ? 7
    : depthConf.maxOpps

  const geoLabel = MARKET_GEOGRAPHIES[params.params.geography] ?? params.params.geography
  const catLabel = MARKET_CATEGORIES[params.params.category] ?? params.params.category
  const audLabel = MARKET_AUDIENCES[params.params.audience] ?? params.params.audience

  const prompt = buildMarketDiscoveryPrompt({
    geography:      geoLabel,
    category:       catLabel,
    audience:       audLabel,
    maxOpps,
    depthLevel:     tierDef.ideaIgnitionDepth,
    hasGapAnalysis: depthConf.hasGapAnalysis,
    hasMarketData:  depthConf.hasMarketData,
  })

  const result = await orchestrate('opportunity_synthesis', prompt)

  if (result.error) {
    return { opportunities: [], route: 'market', tokensUsed: result.tokensUsed, error: result.error }
  }

  const { data, error: parseError } = parseAIJson<{ opportunities: RawOpportunity[] }>(result.content)

  if (parseError || !data?.opportunities) {
    return { opportunities: [], route: 'market', tokensUsed: result.tokensUsed, error: 'Could not parse opportunities' }
  }

  const scored = await scoreAndRankOpportunities(data.opportunities, tier, result.tokensUsed)
  return { ...scored, route: 'market' }
}

// ── PROMPT BUILDERS ──────────────────────────────────────────

interface RawOpportunity {
  title:         string
  audience:      string
  transformation:string
  format:        string
  price_min:     number
  price_max:     number
  demand_level:  string
  gap_type:      string | null
  reasoning:     string
}

function buildSelfDiscoveryPrompt(p: {
  category:       string
  subCategory:    string
  responses:      SecretFrameworkResponses
  maxOpps:        number
  geo:            string
  depthLevel:     string
  hasGapAnalysis: boolean
}): string {
  return `You are the Z2B Opportunity Discovery Engine.

A builder from ${p.geo} has shared their background in: ${p.category}${p.subCategory ? ' — ' + p.subCategory : ''}.

Their SECRET Framework responses:
PROBLEMS they have solved: "${p.responses.problems}"
PASSIONS they have: "${p.responses.passions}"
SKILLS people would pay for: "${p.responses.skills}"
TRENDS they see: "${p.responses.trends}"
TRANSFORMATIONS they have created: "${p.responses.transformations}"

Your task: Discover ${p.maxOpps} specific digital product opportunities from this builder's real knowledge.

STRICT RULES:
- Every opportunity must be SPECIFIC: a real person with a real problem wanting a real transformation
- NO generic ideas like "a guide to business" or "a health ebook"
- Price in ZAR. Realistic for ${p.geo} market.
- Format must match the content: don't force everything into an eBook
- Demand must be real — would people actually search for and pay for this?
${p.hasGapAnalysis ? '- Include gap_type: is there a language gap, format gap, price gap, or depth gap in the market?' : ''}
- Depth level for this tier: ${p.depthLevel}

Return ONLY valid JSON in this exact format:
{
  "opportunities": [
    {
      "title": "specific product title",
      "audience": "specific person description (age, situation, pain)",
      "transformation": "their before state → their after state using this product",
      "format": "eBook|Course|Template|Checklist|Workbook|Toolkit|Masterclass|Guide",
      "price_min": 99,
      "price_max": 299,
      "demand_level": "low|medium|high|very_high",
      "gap_type": "language_gap|format_gap|price_gap|depth_gap|pioneer|null",
      "reasoning": "one sentence why this specific person would pay for this"
    }
  ]
}`
}

function buildMarketDiscoveryPrompt(p: {
  geography:      string
  category:       string
  audience:       string
  maxOpps:        number
  depthLevel:     string
  hasGapAnalysis: boolean
  hasMarketData:  boolean
}): string {
  return `You are the Z2B Market Intelligence Engine.

Analyze the digital product market for:
Geography: ${p.geography}
Category: ${p.category}
Target Audience: ${p.audience}

Your task: Find ${p.maxOpps} specific, monetizable digital product opportunities with REAL market demand.

ANALYSIS REQUIREMENTS:
1. Problems in demand — what specific problems is this audience actively searching for solutions to?
2. Skills in demand — what would they pay to learn or have done for them?
3. Emerging trends — what is rising in this market right now?
4. Transformation demand — what before→after journeys are people desperately seeking?
5. Supply gaps — where does demand exist but quality products do not?

STRICT RULES:
- Every opportunity must have EVIDENCE of demand (search patterns, social conversations, marketplace gaps)
- Price in ZAR. Realistic for this geography and audience.
- No generic ideas. Specific audience + specific problem + specific transformation only.
- Filter fake trends: only include opportunities with sustained, real demand
${p.hasGapAnalysis ? '- Identify the specific gap type: language, format, price, depth, or pioneer' : ''}
- Depth level: ${p.depthLevel}

Return ONLY valid JSON:
{
  "opportunities": [
    {
      "title": "specific product title",
      "audience": "specific person description (situation, pain, context)",
      "transformation": "before state → after state",
      "format": "eBook|Course|Template|Checklist|Workbook|Toolkit|Masterclass|Guide",
      "price_min": 99,
      "price_max": 499,
      "demand_level": "low|medium|high|very_high",
      "gap_type": "language_gap|format_gap|price_gap|depth_gap|pioneer|null",
      "reasoning": "evidence of demand for this specific opportunity"
    }
  ]
}`
}

// ── OPPORTUNITY SCORER ───────────────────────────────────────

async function scoreAndRankOpportunities(
  raw:         RawOpportunity[],
  tierId:      string,
  tokensSoFar: number
): Promise<Omit<IgnitionResult, 'route'>> {
  // Score using GPT-5.x (7-dimension model from architecture)
  const scoringPrompt = `Score these digital product opportunities on 7 dimensions (each 0-20):
1. Profitability — can it sell at the stated price?
2. Demand — evidence of real search/social demand?
3. Scalability — can it reach beyond one market?
4. Transformation Value — how urgently is this needed?
5. Content Sustainability — can a creator keep building in this niche?
6. Creator Compatibility — does this match a motivated creator's ability?
7. Audience Urgency — how quickly does this audience need this?

Opportunities to score:
${JSON.stringify(raw.map((o, i) => ({ index: i, title: o.title, audience: o.audience, transformation: o.transformation })))}

Return ONLY valid JSON:
{ "scores": [{ "index": 0, "total": 85, "demand_confidence": "high" }] }`

  const scoreResult = await orchestrate('opportunity_scoring', scoringPrompt)
  const { data: scoreData } = parseAIJson<{ scores: { index: number; total: number; demand_confidence: string }[] }>(
    scoreResult.content
  )

  const scores = scoreData?.scores ?? []
  const totalTokens = tokensSoFar + scoreResult.tokensUsed

  // Map raw → public opportunities (strip internal scoring data)
  const opportunities: IgnitionOpportunity[] = raw.map((o, i) => {
    const scoreEntry = scores.find(s => s.index === i)
    const score      = scoreEntry?.total ?? 50
    // Log scoring failures for debugging (Low issue #10)
    if (!scoreEntry) {
      console.warn('[ignition-engine] No score for opportunity', i, '— using default 50')
    }

    // Map score to demand level for display (score stays hidden)
    const demandDisplay = (score >= 80) ? 'very_high'
      : (score >= 65) ? 'high'
      : (score >= 50) ? 'medium'
      : 'low'

    return {
      id:             randomUUID(),
      title:          o.title,
      audience:       o.audience,
      transformation: o.transformation,
      format:         o.format,
      priceRangeMin:  o.price_min,
      priceRangeMax:  o.price_max,
      demandLevel:    (o.demand_level as IgnitionOpportunity['demandLevel']) ?? demandDisplay,
      gapType:        o.gap_type === 'null' ? null : (o.gap_type ?? null),
      _score:         score,        // hidden — never sent to UI
    }
  })

  // Sort by score descending (builder sees ranked list without scores)
  opportunities.sort((a, b) => (b._score ?? 0) - (a._score ?? 0))

  // Filter out very low scoring (< 35) — don't show junk
  const filtered = opportunities.filter(o => (o._score ?? 0) >= 35)

  return {
    opportunities: filtered,
    tokensUsed:    totalTokens,
    error:         null,
  }
}

// ── SAVE IGNITION LOG ────────────────────────────────────────

export async function saveIgnitionLog(params: {
  builderId:        string
  sessionId?:       string
  route:            'self' | 'market'
  category?:        string
  subCategory?:     string
  secretResponses?: SecretFrameworkResponses
  marketParams?:    MarketParams
  opportunitiesShown: IgnitionOpportunity[]
  selectedOpp?:     IgnitionOpportunity
}) {
  // Reuse same server client pattern as session-manager (module-level memoization)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Strip hidden scores before saving shown opportunities
  const safeOpps = params.opportunitiesShown.map(({ _score, _pmfScore, _viralScore, ...safe }) => safe)

  await (supabase.from as any)('idea_ignition_logs').insert({
    builder_id:         params.builderId,
    session_id:         params.sessionId ?? null,
    route:              params.route,
    category:           params.category ?? null,
    sub_category:       params.subCategory ?? null,
    secret_responses:   params.secretResponses ?? null,
    market_params:      params.marketParams ?? null,
    opportunities_shown: safeOpps,
    selected_opp:       params.selectedOpp
      ? (({ _score, _pmfScore, _viralScore, ...safe }) => safe)(params.selectedOpp)
      : null,
    rejected_opps:      [],
    regen_count:        0,
  })
}

// ── REGENERATION GUARD ───────────────────────────────────────
// Enforces max 2 regenerations per session (architecture law)

export function canRegenerate(regenCount: number): boolean {
  return regenCount < 2
}

export function getRegenMessage(regenCount: number): string {
  if (regenCount === 0) return 'You can request new options up to 2 times.'
  if (regenCount === 1) return 'You have 1 regeneration left.'
  return 'Maximum regenerations reached. Please select from the options shown.'
}
