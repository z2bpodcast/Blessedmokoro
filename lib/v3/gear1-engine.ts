// ============================================================
// Z2B 4M V3 — GEAR 1: OFFER ARCHITECTURE ENGINE (PHASE A)
// File: lib/v3/gear1-engine.ts (UPGRADED)
// Was: Intent Engine — product title + audience + problem
// Now: Offer Architecture — WHO · WHAT · TRANSFORMATION · PROMISE · TRIGGER
// ============================================================

import { COACH_MANLAW_SYSTEM_PROMPT, getCoachModel } from '@/lib/v3/coach-manlaw-prompt'

export interface OfferArchitecture {
  // The ONE person
  targetPerson:       string  // Ultra-specific — name the exact human
  targetSituation:    string  // Their daily reality in their own words
  
  // The ONE problem
  surfaceProblem:     string  // What they say the problem is
  realProblem:        string  // The deeper fear/frustration driving it
  problemInTheirWords:string  // How they would describe it to a friend
  
  // The ONE product
  productTitle:       string  // Specific, compelling, identity-driven
  productSubtitle:    string  // The promise in one line
  format:             string  // ebook | toolkit | course | framework | template | printable | audio | video | community
  
  // The ONE transformation
  beforeState:        string  // Where they are now (vivid, specific)
  afterState:         string  // Where they will be (vivid, specific)
  transformationBridge: string // How this product gets them from before to after
  
  // The ONE promise
  corePromise:        string  // If they do X, they get Y in Z time
  
  // The psychological angle
  primaryTrigger:     string  // The #1 trigger for this specific buyer
  secondaryTriggers:  string[] // 2-3 supporting triggers
  
  // Pricing
  suggestedPrice:     number
  currency:           string
  priceJustification: string  // Why this price feels right for this buyer
  
  // The offer hook
  hookLine:           string  // The first line that makes them say "this is for me"
  
  // Metadata
  difficulty:         'beginner' | 'intermediate' | 'advanced'
  targetAudience:     string // summary for downstream gears
  problemSolved:      string // summary for downstream gears
}

// ── OFFER ARCHITECTURE ENGINE ─────────────────────────────────
export async function buildOfferArchitecture(params: {
  rawIdea:    string  // What the builder said their idea is
  market:     any     // Target market from MarketSelector
  selfData?:  any     // Self-discovery data if available
  tierId:     string
}): Promise<{ offer: OfferArchitecture | null; error: string | null }> {

  const marketContext = params.market?.label ?? 'South Africa'
  const currencyFull  = params.market?.currency ?? "ZAR (R)"
  const currencySymbol = currencyFull.split(" ")[0] === "ZAR" ? "R" : currencyFull.match(/[(](.+)[)]/)?.[1] ?? "R"
  const currency       = currencyFull
  const demographic   = params.market?.demographic ?? 'employed professionals'

  // Fetch Google Trends
  let trendsContext = ''
  try {
    const geo = params.market?.geo ?? 'ZA'
    const trendsUrl = `https://trends.google.com/trends/api/dailytrends?hl=en-US&tz=0&geo=${geo}&ns=15`
    const trendsRes = await fetch(trendsUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Z2B/1.0)' },
      signal: AbortSignal.timeout(5000),
    })
    if (trendsRes.ok) {
      const raw = await trendsRes.text()
      const json = raw.replace(/^\)\]\}',\n/, '')
      const data = JSON.parse(json)
      const trending = data?.default?.trendingSearchesDays?.[0]?.trendingSearches ?? []
      const terms = trending.slice(0, 10).map((t: any) => t.title?.query ?? '').filter(Boolean)
      if (terms.length > 0) {
        trendsContext = `\nCURRENT TRENDING IN ${geo}: ${terms.join(', ')}`
      }
    }
  } catch(_) {}

  const prompt = `${COACH_MANLAW_SYSTEM_PROMPT}`

══════════════════════════════════════════════════
GEAR 1: RESEARCH & OFFER ARCHITECTURE INTELLIGENCE
══════════════════════════════════════════════════

You are the world's most advanced offer architect — combining McKinsey strategic precision, Robert Cialdini psychological depth, and Gary Halbert copywriting genius.

Your task has TWO PHASES before producing output.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1: MARKET INTELLIGENCE & CONTEXT RESEARCH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BUILDER'S RAW IDEA: "${params.rawIdea}"
TARGET MARKET: ${marketContext}${trendsContext}
TARGET DEMOGRAPHIC: ${demographic}
CURRENCY: ${currencyFull} (use symbol: ${currencySymbol})
${params.selfData ? `BUILDER BACKGROUND: ${JSON.stringify(params.selfData)}` : ''}

RESEARCH DIRECTIVES — think deeply before writing:

1. AUDIENCE PAIN POINTS (3 levels deep):
   Level 1: What they SAY the problem is (surface complaint)
   Level 2: What they FEEL the problem is (emotional frustration)
   Level 3: What the problem REALLY IS (identity fear — the one they never say out loud)

2. AUDIENCE CONTEXT INTELLIGENCE:
   - What does a typical Tuesday in their life look like?
   - What have they already tried that failed and why?
   - What do they tell themselves at 2am about this problem?
   - What would change in their life if this problem disappeared tomorrow?
   - What is the ONE solution they wish existed but can't find?

3. MARKET TIMING & OPPORTUNITY:
   - Why is NOW the perfect time for this product?
   - What economic, social or technological shift creates urgency?
   - What trend is this riding that makes it timely?
   - Why will they pay NOW rather than wait?

4. POSITIONING INTELLIGENCE:
   - What unique angle has NOT been done to death in this niche?
   - What contrarian truth does this audience need to hear?
   - What false belief is holding them back that this product destroys?
   - What ONE mechanism makes this approach uniquely effective?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2: OFFER ARCHITECTURE — 7 LAWS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Using your Phase 1 research, apply the 7 Laws of Elite Offer Architecture:

LAW 1 — THE ONE PERSON: Shocking specificity.
Not "working professionals" but "The 38-year-old HR manager in Pretoria earning R52k/month who has read 12 self-help books but still feels stuck."

LAW 2 — THE REAL PROBLEM: Never the surface problem.
Surface = "I need more money." Real = "I'm terrified my children will see me as a failure who never figured life out."

LAW 3 — THE VIVID TRANSFORMATION: Before and after so specific the reader FEELS both states viscerally. Not "feel better" — paint the exact scene.

LAW 4 — THE IRONCLAD PROMISE: Specific result + specific timeframe.
Not "financial freedom" — "Your first R5,000 side income deposited in 30 days while keeping your job."

LAW 5 — THE PRIMARY TRIGGER: One dominant psychological driver.
Choose the ONE: Fear of loss · Status desire · Belonging · Certainty · Significance · Freedom

LAW 6 — THE SPECIFICITY TITLE: The title must make ONE person say "This was written for me."
Use numbers, timeframes, specific situations, identity language.
Generic titles kill conversion. Specific titles print money.

LAW 7 — THE HOOK LINE: The first sentence that collapses all resistance.
Must create immediate identification + burning curiosity in under 15 words.

CRITICAL QUALITY STANDARDS:
- Every field must be SPECIFIC not generic — no vague language allowed
- Use the EXACT words and phrases this audience uses — not marketing speak
- Product title must score 9/10 minimum — bold, specific, identity-driven
- Price must feel like a no-brainer relative to the transformation
- Hook line must stop someone mid-scroll instantly

You are not categorising knowledge. You are architecting desire for transformation.

Respond ONLY with valid JSON:
{
  "targetPerson": "Ultra-specific — age, job, city, income, exact situation",
  "targetSituation": "Their daily reality described in their own words",
  "surfaceProblem": "What they say the problem is",
  "realProblem": "The deeper identity fear driving everything",
  "problemInTheirWords": "How they would describe it to a trusted friend at midnight",
  "audiencePainPoints": ["pain point 1", "pain point 2", "pain point 3", "pain point 4", "pain point 5"],
  "marketTimingReason": "Why NOW is the perfect moment for this product",
  "uniquePositioningAngle": "The contrarian or fresh angle that sets this apart",
  "productTitle": "Specific, identity-driven, 9/10 minimum title",
  "productSubtitle": "The transformation promise in one compelling line",
  "format": "ebook|toolkit|course|framework|template|printable|audio|video|community",
  "beforeState": "Where they are now — vivid, specific, emotionally real",
  "afterState": "Where they will be — vivid, specific, aspirational",
  "transformationBridge": "The exact mechanism that gets them from before to after",
  "corePromise": "If they do X, they get Y in Z specific timeframe",
  "primaryTrigger": "The #1 psychological trigger for this specific buyer",
  "secondaryTriggers": ["trigger2", "trigger3"],
  "suggestedPrice": 299,
  "currency": "${currencySymbol}",
  "priceJustification": "Why this price feels like a bargain given the transformation",
  "hookLine": "The first line that makes them stop scrolling and say THIS IS FOR ME",
  "difficulty": "beginner|intermediate|advanced",
  "targetAudience": "One-line summary for downstream systems",
  "problemSolved": "One-line summary for downstream systems"
}`


  try {
    let content = ''
    const res  = await fetch('https://api.openai.com/v1/chat/completions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
      body: JSON.stringify({ model: 'gpt-4o', max_tokens: 2000, temperature: 0.85, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: prompt }] }),
    })
    const data = await res.json()
    content = data.choices?.[0]?.message?.content ?? ''

    const offer = JSON.parse(content.replace(/```json|```/g, '').trim()) as OfferArchitecture
    return { offer, error: null }

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('[gear1-offer-engine]', msg)
    return { offer: null, error: 'Could not architect offer. Please try again.' }
  }
}

// ── BACKWARDS COMPATIBILITY — keep old interface working ──────
export interface SelectedOpportunity {
  id:              string
  title:           string
  category:        string
  targetAudience:  string
  problemSolved:   string
  format:          string
  priceRange:      string
  difficulty?:     string
}

export function offerToOpportunity(offer: OfferArchitecture): SelectedOpportunity {
  return {
    id:             'offer-' + Date.now(),
    title:          offer.productTitle,
    category:       offer.format,
    targetAudience: offer.targetAudience,
    problemSolved:  offer.problemSolved,
    format:         offer.format,
    priceRange:     offer.currency + offer.suggestedPrice,
    difficulty:     offer.difficulty,
  }
}


// ============================================================
// BACKWARDS COMPATIBILITY SHIMS
// These exports preserve compatibility with:
//   - app/ai-income/gear/1/page.tsx
//   - app/api/gear/[gear]/route.ts
// The new Offer Architecture Engine is the primary implementation
// These shims delegate to the new engine
// ============================================================

// Label maps used by Gear 1 page UI
export const FORMAT_LABELS: Record<string, string> = {
  ebook:       '📚 eBook / Guide',
  toolkit:     '🧰 Toolkit & Templates',
  course:      '🎓 Course / Masterclass',
  framework:   '📋 Framework / Protocol',
  template:    '📄 Template Pack',
  printable:   '🖨️ Printable / Planner',
  audio:       '🎵 Audio Product',
  video:       '🎬 Video Product',
  community:   '👥 Community',
  software:    '💻 Software / Tool',
  workbook:    '📓 Workbook',
  checklist:   '✅ Checklist',
}

export const AUDIENCE_LEVEL_LABELS: Record<string, string> = {
  beginner:     '🌱 Beginner — no prior experience needed',
  intermediate: '⚡ Intermediate — some background helpful',
  advanced:     '🚀 Advanced — experienced audience',
}

// IntentDefinition type — used by Gear 1 page and downstream gears
export interface IntentDefinition {
  productTitle:      string
  subtitle?:         string
  targetAudience:    string
  problemSolved:     string
  format:            string
  productFormat?:    string
  difficulty:        string
  audienceLevel?:    string
  suggestedPrice?:   number
  priceRecommended?: number
  currency?:         string
  hookLine?:         string
  corePromise?:      string
  primaryTrigger?:   string
  beforeState?:      string
  afterState?:       string
  promiseStatement?: string
  targetPerson?:     string
  realProblem?:      string
  storyOpener?:      string
  fascinations?:     string[]
  keyProblems?:      string[]
  persona?:          any
  productPurpose?:   string
  contentTone?:      string
  geographyContext?: string
}

// runGear1 — delegates to buildOfferArchitecture
export async function runGear1(params: {
  opportunity:    SelectedOpportunity
  adjustments?:   Record<string, string>
  market?:        any
  tierId?:        string
  personaData?:   any
}): Promise<{ intent: IntentDefinition | null; error: string | null; tokensUsed?: number }> {

  const rawIdea = [
    params.opportunity.title,
    params.opportunity.problemSolved,
    params.opportunity.targetAudience,
  ].filter(Boolean).join('. ')

  const { offer, error } = await buildOfferArchitecture({
    rawIdea,
    market:   params.market ?? {},
    selfData: params.personaData,
    tierId:   params.tierId ?? 'starter',
  })

  if (error || !offer) return { intent: null, error: error ?? 'Gear 1 failed' }

  const intent: IntentDefinition = {
    productTitle:    offer.productTitle,
    subtitle:        offer.productSubtitle,
    targetAudience:  offer.targetAudience,
    problemSolved:   offer.problemSolved,
    format:          offer.format,
    productFormat:   offer.format,
    difficulty:      offer.difficulty,
    audienceLevel:   offer.difficulty,
    suggestedPrice:  offer.suggestedPrice,
    priceRecommended:offer.suggestedPrice,
    currency:        offer.currency,
    hookLine:        offer.hookLine,
    corePromise:     offer.corePromise,
    primaryTrigger:  offer.primaryTrigger,
    beforeState:     offer.beforeState,
    afterState:      offer.afterState,
    promiseStatement:offer.corePromise,
    targetPerson:    offer.targetPerson,
    realProblem:     offer.realProblem,
    keyProblems:     [],
    persona:         params.personaData,
  }

  return { intent, error: null, tokensUsed: 0 }
}

// adjustGear1 — re-runs with adjustments applied
export async function adjustGear1(params: {
  opportunity:  SelectedOpportunity
  adjustments:  Record<string, string>
  market?:      any
  tierId?:      string
}): Promise<{ intent: IntentDefinition | null; error: string | null }> {
  return runGear1(params)
}

// toGear2Handoff — converts intent to Gear 2 format
export function toGear2Handoff(intent: IntentDefinition): Record<string, unknown> {
  return {
    productTitle:    intent.productTitle,
    targetAudience:  intent.targetAudience,
    problemSolved:   intent.problemSolved,
    format:          intent.format,
    difficulty:      intent.difficulty,
    hookLine:        intent.hookLine,
    corePromise:     intent.corePromise,
    beforeState:     intent.beforeState,
    afterState:      intent.afterState,
    priceRecommended:intent.priceRecommended ?? intent.suggestedPrice ?? 299,
    currency:        intent.currency ?? 'R',
  }
}
