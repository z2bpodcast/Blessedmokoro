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
  const currency      = params.market?.currency ?? 'ZAR (R)'
  const demographic   = params.market?.demographic ?? 'employed professionals'

  const prompt = `${COACH_MANLAW_SYSTEM_PROMPT}

══════════════════════════════════════════════════
OFFER ARCHITECTURE SESSION
══════════════════════════════════════════════════

A builder has come to you with a raw idea. Your job is to architect a complete offer — not just a product.

BUILDER'S RAW IDEA: "${params.rawIdea}"
TARGET MARKET: ${marketContext}
TARGET DEMOGRAPHIC: ${demographic}
CURRENCY: ${currency}
${params.selfData ? `BUILDER BACKGROUND: ${JSON.stringify(params.selfData)}` : ''}

Apply the 5 Foundations of Offer Architecture:
1. Define THE ONE PERSON with shocking specificity
2. Surface THE REAL PROBLEM beneath what they said
3. Craft THE TRANSFORMATION as a vivid before/after
4. Write THE PROMISE — specific, measurable, believable
5. Select THE PRIMARY TRIGGER that will open this buyer's purse

Then apply the Law of Specificity to the product title.
The title must make the exact target buyer say "This is for ME."

IMPORTANT: Think like a $100M copywriter, not a product manager.
You are not categorising knowledge. You are architecting desire.

Respond ONLY with valid JSON matching this exact structure:
{
  "targetPerson": "Ultra-specific description of the ONE person",
  "targetSituation": "Their daily reality in their own words",
  "surfaceProblem": "What they say the problem is",
  "realProblem": "The deeper fear/frustration beneath the surface",
  "problemInTheirWords": "How they would describe it to a trusted friend",
  "productTitle": "Specific, identity-driven product title",
  "productSubtitle": "The promise in one compelling line",
  "format": "ebook|toolkit|course|framework|template|printable|audio|video|community",
  "beforeState": "Where they are now — vivid and specific",
  "afterState": "Where they will be — vivid and specific",
  "transformationBridge": "How this product gets them from before to after",
  "corePromise": "If they do X, they get Y in Z timeframe",
  "primaryTrigger": "The #1 psychological trigger for this buyer",
  "secondaryTriggers": ["trigger2", "trigger3"],
  "suggestedPrice": 299,
  "currency": "R",
  "priceJustification": "Why this price feels right — not too cheap, not scary",
  "hookLine": "The first line that makes them say THIS IS FOR ME",
  "difficulty": "beginner|intermediate|advanced",
  "targetAudience": "One-line summary for downstream systems",
  "problemSolved": "One-line summary for downstream systems"
}`

  try {
    const model = getCoachModel('psychology')
    const isOpus = model.includes('claude')

    let content = ''

    if (isOpus) {
      const res  = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type':      'application/json',
          'x-api-key':         process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await res.json()
      content = data.content?.[0]?.text ?? ''
    } else {
      const res  = await fetch('https://api.openai.com/v1/chat/completions', {
          model:           'gpt-4o',
          temperature:     0.85,
          response_format: { type: 'json_object' },
        }),
      })
      const data = await res.json()
      content = data.choices?.[0]?.message?.content ?? ''
  }

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
  priceRange:      string
}

export function offerToOpportunity(offer: OfferArchitecture): SelectedOpportunity {
  return {
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
  subtitle?:      string
  productFormat?:  string
  audienceLevel?:  string
  priceRecommended?: number
  promiseStatement?: string
  keyProblems?:    string[]
  persona?:        any
  productPurpose?: string
  contentTone?:    string
  geographyContext?: string
}

// runGear1 — delegates to buildOfferArchitecture
export async function runGear1(params: {
  opportunity:    SelectedOpportunity
  adjustments?:   Record<string, string>
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
