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
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
        body:    JSON.stringify({
          model,
          max_tokens: 2000,
          temperature: 0.85,
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: prompt }],
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
  targetAudience:  string
  problemSolved:   string
  format:          string
  priceRange:      string
  difficulty:      string
}

export function offerToOpportunity(offer: OfferArchitecture): SelectedOpportunity {
  return {
    id:             'offer-' + Date.now(),
    title:          offer.productTitle,
    category:       offer.format,
    targetAudience: offer.targetAudience,
    problemSolved:  offer.problemSolved,
    format:         offer.format,
    priceRange:     `${offer.currency}${offer.suggestedPrice}`,
    difficulty:     offer.difficulty,
  }
}
