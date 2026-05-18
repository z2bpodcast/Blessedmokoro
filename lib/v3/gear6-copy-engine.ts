// ============================================================
// Z2B 4M V3 — GEAR 6: $100M COPYWRITING ENGINE (PHASE B)
// File: lib/v3/gear6-copy-engine.ts
// Deploys 13 psychological buying triggers on every listing
// Claude Opus for psychological depth · GPT-4o for structure
// ============================================================

import { COACH_MANLAW_SYSTEM_PROMPT, getCoachModel } from '@/lib/v3/coach-manlaw-prompt'

export interface CopyPackage {
  // Headline variants (3 options with different primary triggers)
  headlines: {
    primary:   string  // Main recommended headline
    variant_a: string  // Alternative — different trigger
    variant_b: string  // Alternative — different angle
  }
  
  // Sub-headline
  subheadline: string
  
  // Hook — first line of description (makes buyer say "this is for me")
  hookLine: string
  
  // Story opener — 3 sentences that make the buyer feel understood
  storyOpener: string
  
  // Fascination bullets (curiosity + benefit + specificity combined)
  fascinations: string[]  // 7 bullets minimum
  
  // The offer stack (what they get + value)
  offerStack: {
    item:       string
    value:      string
    included:   boolean
  }[]
  
  // The promise statement
  promiseStatement: string
  
  // Social proof placeholder (what to say before first sale)
  socialProofBridge: string
  
  // Objection crushers
  objections: {
    objection: string
    crusher:   string
  }[]
  
  // The close (final CTA with urgency)
  closeStatement: string
  
  // Platform-specific descriptions
  platformCopy: {
    z2b:      string  // Full description for Z2B marketplace
    selar:    string  // Max 500 chars
    gumroad:  string  // Rich, up to 3000 chars
    payhip:   string  // Up to 2000 chars
    whatsapp: string  // Personal broadcast message
  }
  
  // Social posts
  socialPosts: {
    instagram: string
    facebook:  string
    linkedin:  string
    twitter:   string
    whatsapp:  string
  }
  
  // Keywords for SEO/discovery
  keywords: string[]
  
  // Triggers deployed
  triggersDeployed: string[]
  
  // Price psychology
  priceAnchoring: string  // How to present the price
}

export async function runCopywritingEngine(params: {
  offer:         any   // OfferArchitecture from Gear 1
  draft:         any   // ContentDraft from Gear 3
  assets:        any   // Enhancement assets from Gear 5
  price:         number
  currency:      string
  market:        any
  tierId:        string
}): Promise<{ copy: CopyPackage | null; error: string | null }> {

  const { offer, draft, price, currency, market } = params
  const marketLabel = market?.label ?? 'South Africa'

  const prompt = `${COACH_MANLAW_SYSTEM_PROMPT}

══════════════════════════════════════════════════
$100 MILLION DOLLAR COPYWRITING SESSION
══════════════════════════════════════════════════

You are now writing the complete copy package for a digital product. This is not a product description. This is a conversion machine — every word is chosen to move the right buyer from interest to purchase.

PRODUCT DETAILS:
Title: ${offer?.productTitle ?? draft?.productTitle ?? 'Digital Product'}
Subtitle: ${offer?.productSubtitle ?? ''}
Target person: ${offer?.targetPerson ?? offer?.targetAudience ?? 'professionals'}
Real problem: ${offer?.realProblem ?? offer?.problemSolved ?? ''}
Before state: ${offer?.beforeState ?? ''}
After state: ${offer?.afterState ?? ''}
Core promise: ${offer?.corePromise ?? ''}
Hook line: ${offer?.hookLine ?? ''}
Primary trigger: ${offer?.primaryTrigger ?? 'Identity alignment'}
Secondary triggers: ${(offer?.secondaryTriggers ?? []).join(', ')}
Price: ${currency}${price}
Market: ${marketLabel}
Format: ${offer?.format ?? draft?.format ?? 'ebook'}

ASSETS INCLUDED (from Gear 5):
${JSON.stringify(params.assets?.assets?.map((a: any) => a.title ?? a.type) ?? [], null, 2)}

YOUR TASK:
Deploy the 13 psychological buying triggers with surgical precision.

RULES:
1. Lead with the buyer — never with the product
2. The headline must make the exact target buyer say "This is for me"
3. Fascination bullets = curiosity + benefit + specificity in one line
4. The story opener must make the buyer feel understood in 3 sentences
5. The close must create urgency without being salesy
6. Platform copy must respect character limits
7. Price anchoring must make ${currency}${price} feel like relief, not resistance

Write the complete copy package as valid JSON matching this structure:
{
  "headlines": {
    "primary": "Main headline with primary trigger deployed",
    "variant_a": "Alternative headline — different trigger",
    "variant_b": "Alternative headline — different angle"
  },
  "subheadline": "The promise in one compelling line",
  "hookLine": "The first line that makes them say THIS IS FOR ME",
  "storyOpener": "3 sentences. Buyer feels seen. Buyer feels hope. Buyer needs to know more.",
  "fascinations": [
    "The little-known reason why [specific outcome] — and the 3-minute fix that changes everything",
    "Why most [target person] never [achieve outcome] — and the exact framework that solves it",
    "How to [achieve outcome] even if [common objection]",
    "The [specific method] that [specific person] used to [specific result] in [specific timeframe]",
    "What nobody tells you about [topic] — and why knowing this changes your approach entirely",
    "The [number]-step [framework name] that eliminates [specific pain] for good",
    "Why [common solution] fails 80% of the time — and the alternative that actually works"
  ],
  "offerStack": [
    { "item": "Main product name", "value": "${currency}${price * 3}", "included": true },
    { "item": "Asset name from Gear 5", "value": "${currency}${Math.round(price * 0.5)}", "included": true }
  ],
  "promiseStatement": "Complete [product] and [specific outcome] in [timeframe] — or [guarantee]",
  "socialProofBridge": "What to say before your first sale to build credibility without lying",
  "objections": [
    { "objection": "I don't have time", "crusher": "Specific response that removes this objection" },
    { "objection": "I'm not an expert", "crusher": "Specific response" },
    { "objection": "The price is too high", "crusher": "Value reframe that makes price feel small" }
  ],
  "closeStatement": "Final CTA with urgency — specific, confident, clear next step",
  "platformCopy": {
    "z2b": "Full Z2B marketplace description — unlimited length, deploy all triggers",
    "selar": "Selar description max 500 chars — African audience, ZAR pricing",
    "gumroad": "Gumroad description up to 3000 chars — global audience, rich formatting with line breaks",
    "payhip": "Payhip description up to 2000 chars — international buyers",
    "whatsapp": "Personal WhatsApp broadcast — conversational, include payment link placeholder [PAYMENT_LINK]"
  },
  "socialPosts": {
    "instagram": "Instagram caption — hook in first line, story, CTA, hashtags",
    "facebook": "Facebook post — longer, storytelling, community angle",
    "linkedin": "LinkedIn post — professional tone, authority, transformation story",
    "twitter": "Twitter/X — punchy, 280 chars, hook + CTA",
    "whatsapp": "WhatsApp status — short, personal, direct"
  },
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "triggersDeployed": ["Specificity", "Pain agitation", "Identity alignment"],
  "priceAnchoring": "How to present ${currency}${price} so it feels like the obvious right decision"
}`

  try {
    // Use Opus for psychological depth on the full copy
    const model  = getCoachModel('copy')
    const isOpus = model.includes('claude')
    let content  = ''

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
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await res.json()
      content    = data.content?.[0]?.text ?? ''
    } else {
      const res  = await fetch('https://api.openai.com/v1/chat/completions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
        body:    JSON.stringify({
          model,
          max_tokens: 4000,
          temperature: 0.9,
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await res.json()
      content    = data.choices?.[0]?.message?.content ?? ''
    }

    const copy = JSON.parse(content.replace(/```json|```/g, '').trim()) as CopyPackage
    return { copy, error: null }

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('[gear6-copy-engine]', msg)
    return { copy: null, error: 'Could not generate copy package. Please try again.' }
  }
}
