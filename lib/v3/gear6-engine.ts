// ============================================================
// Z2B 4M V3 — GEAR 6 DISTRIBUTION ENGINE
// File: lib/v3/gear6-engine.ts
// Laws: GPT-5.x writes listing · Builder approves
//       Marketplace publish on confirm · Session completes
//       Rocket tiers flag for n8n automation
// ============================================================

import { randomUUID }               from 'crypto'
import { orchestrate, parseAIJson } from '@/lib/v3/orchestration-router'
import { normaliseTier }             from '@/lib/v3/tier-config'
import type { IntentDefinition }     from '@/lib/v3/gear1-engine'

// ── TYPES ────────────────────────────────────────────────────

export interface MarketplaceListing {
  title:           string
  tagline:         string       // one punchy line
  description:     string       // 3 paragraphs: problem, solution, transformation
  targetAudience:  string
  keyBenefits:     string[]     // 3-5 bullet points
  priceZar:        number
  format:          string
  keywords:        string[]     // 5 SEO keywords
  promotionalAngle:string       // the core hook for social
}

export interface SocialPost {
  platform:  'facebook' | 'instagram' | 'whatsapp'
  content:   string
  hashtags:  string[]
}

export interface DistributionPackage {
  listing:     MarketplaceListing
  socialPosts: SocialPost[]
  launchDate:  string           // ISO date
  isApproved:  boolean
}

export interface Gear6Result {
  package:    DistributionPackage | null
  tokensUsed: number
  error:      string | null
}

// ── DISTRIBUTION ENGINE ───────────────────────────────────────

export async function buildDistributionPackage(params: {
  intent:    IntentDefinition
  wordCount: number
  sections:  number
  tierId:    string
}): Promise<Gear6Result> {
  const { intent } = params

  // Step 1: GPT-5.x writes the marketplace listing
  const listingPrompt = buildListingPrompt(intent, params.wordCount, params.sections)
  const listingResult = await orchestrate('distribution_strategy', listingPrompt)

  if (listingResult.error) {
    return { package: null, tokensUsed: listingResult.tokensUsed, error: listingResult.error }
  }

  const { data: listing, error: parseError } = parseAIJson<MarketplaceListing>(listingResult.content)

  if (parseError || !listing?.title) {
    // Fallback listing from intent data
    const fallback = buildFallbackListing(intent)
    console.warn('[gear6-engine] Listing parse failed — using fallback')
    return buildWithSocialPosts(fallback, intent, params.tierId, listingResult.tokensUsed)
  }

  // Validate and clamp price
  listing.priceZar = Math.max(49, Math.min(4999, Math.round(listing.priceZar ?? intent.priceRecommended)))

  return buildWithSocialPosts(listing, intent, params.tierId, listingResult.tokensUsed)
}

async function buildWithSocialPosts(
  listing:    MarketplaceListing,
  intent:     IntentDefinition,
  tierId:     string,
  tokensSoFar:number
): Promise<Gear6Result> {
  // Step 2: GPT-5.x generates social posts (non-blocking if fails)
  const socialPrompt = buildSocialPrompt(listing, intent)
  const socialResult = await orchestrate('social_content', socialPrompt)

  let socialPosts: SocialPost[] = []
  if (!socialResult.error) {
    const { data } = parseAIJson<{ posts: SocialPost[] }>(socialResult.content)
    socialPosts = data?.posts ?? buildFallbackPosts(listing)
  } else {
    socialPosts = buildFallbackPosts(listing)
    console.warn('[gear6-engine] Social posts generation failed — using fallback')
  }

  const pkg: DistributionPackage = {
    listing,
    socialPosts,
    launchDate: new Date().toISOString(),
    isApproved: false,
  }

  return {
    package:    pkg,
    tokensUsed: tokensSoFar + socialResult.tokensUsed,
    error:      null,
  }
}

// ── LISTING ADJUSTMENT ────────────────────────────────────────

export async function adjustListing(params: {
  currentListing: MarketplaceListing
  adjustment:     string
  intent:         IntentDefinition
}): Promise<{ listing: MarketplaceListing | null; tokensUsed: number; error: string | null }> {
  const prompt = `You wrote this marketplace listing:
${JSON.stringify(params.currentListing, null, 2)}

The builder wants to adjust it:
"${params.adjustment}"

Apply ONLY the requested changes. Keep everything else exactly the same.
Return the complete updated listing as valid JSON in the same format.`

  const result = await orchestrate('distribution_strategy', prompt)
  if (result.error) {
    return { listing: params.currentListing, tokensUsed: result.tokensUsed, error: null }
  }

  const { data } = parseAIJson<MarketplaceListing>(result.content)
  if (!data?.title) {
    return { listing: params.currentListing, tokensUsed: result.tokensUsed, error: null }
  }

  data.priceZar = Math.max(49, Math.min(4999, Math.round(data.priceZar ?? params.currentListing.priceZar)))
  return { listing: data, tokensUsed: result.tokensUsed, error: null }
}

// ── PROMPT BUILDERS ───────────────────────────────────────────

function buildListingPrompt(intent: IntentDefinition, wordCount: number, sections: number): string {
  return `You are writing a marketplace listing for a digital product on the Z2B Legacy Builders Marketplace.

PRODUCT DETAILS:
Title: "${intent.productTitle}"
For: "${intent.targetAudience}"
Transformation: "${intent.beforeState}" → "${intent.afterState}"
Promise: "${intent.promiseStatement}"
Format: ${intent.productFormat}
Audience level: ${intent.audienceLevel}
Key problems solved: ${intent.keyProblems.join(', ')}
Content: ${wordCount} words across ${sections} sections
Price: R${intent.priceRecommended}
Geography: ${intent.geographyContext}

WRITING RULES:
- Never use "make money", "earn income", "get rich" or "join my team"
- Use transformation language: "helps you", "gives you", "shows you how to"
- Description: exactly 3 paragraphs (problem, solution, transformation result)
- Benefits: exactly 5 specific, concrete bullet points
- Keywords: 5 search terms this audience would actually type
- Tagline: one punchy sentence under 12 words
- Promotional angle: the ONE hook for social posts

Return ONLY valid JSON:
{
  "title": "compelling product title",
  "tagline": "one punchy line under 12 words",
  "description": "paragraph 1 — the problem\\n\\nparagraph 2 — the solution\\n\\nparagraph 3 — the transformation",
  "targetAudience": "specific person description",
  "keyBenefits": ["benefit 1", "benefit 2", "benefit 3", "benefit 4", "benefit 5"],
  "priceZar": ${intent.priceRecommended},
  "format": "${intent.productFormat}",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "promotionalAngle": "the one hook for social posts"
}`
}

function buildSocialPrompt(listing: MarketplaceListing, intent: IntentDefinition): string {
  return `Write 3 social media posts to launch this digital product.

Product: "${listing.title}"
Tagline: "${listing.tagline}"
Promotional angle: "${listing.promotionalAngle}"
For: "${intent.targetAudience}"
Price: R${listing.priceZar}
Geography: ${intent.geographyContext}

RULES (CRITICAL):
- NEVER use: "make money", "earn income", "get rich", "join my team", "passive income"
- Use transformation language: what changes, what becomes possible
- Each post must have a clear call to action (link in bio / check link / tap link)
- Facebook: 3-4 sentences, conversational, story-driven
- Instagram: punchy opener, 2-3 short lines, strong CTA
- WhatsApp: short and personal, 2-3 lines, feels like a friend sharing

Return ONLY valid JSON:
{
  "posts": [
    { "platform": "facebook",   "content": "post text here", "hashtags": [] },
    { "platform": "instagram",  "content": "post text here", "hashtags": ["#tag1", "#tag2", "#tag3"] },
    { "platform": "whatsapp",   "content": "post text here", "hashtags": [] }
  ]
}`
}

// ── FALLBACK BUILDERS ─────────────────────────────────────────

function buildFallbackListing(intent: IntentDefinition): MarketplaceListing {
  return {
    title:            intent.productTitle,
    tagline:          intent.promiseStatement.slice(0, 80),
    description:      `${intent.beforeState}\n\n${intent.productTitle} gives you a clear, practical system to change that.\n\n${intent.afterState}`,
    targetAudience:   intent.targetAudience,
    keyBenefits:      intent.keyProblems.slice(0, 3).map(p => 'Solve: ' + p).concat(['Clear implementation steps', 'Built for your context']),
    priceZar:         intent.priceRecommended,
    format:           intent.productFormat,
    keywords:         [intent.productTitle.split(' ').slice(0, 2).join(' '), intent.productFormat, 'South Africa', 'digital product', intent.audienceLevel],
    promotionalAngle: intent.promiseStatement,
  }
}

function buildFallbackPosts(listing: MarketplaceListing): SocialPost[] {
  return [
    {
      platform: 'facebook',
      content:  `${listing.tagline}\n\n${listing.description.split('\n\n')[0]}\n\nGet it now — link in bio.`,
      hashtags: [],
    },
    {
      platform: 'instagram',
      content:  `${listing.tagline} 👇\n\n${listing.promotionalAngle}\n\nTap the link in bio to get yours.`,
      hashtags: ['#digitalproduct', '#transformation', '#southafrica'],
    },
    {
      platform: 'whatsapp',
      content:  `Hey! I just launched something I think you need to see.\n\n"${listing.title}" — ${listing.tagline}\n\nCheck it out: [link]`,
      hashtags: [],
    },
  ]
}

// ── TIER HELPERS ──────────────────────────────────────────────

export function isRocketTier(tierId: string): boolean {
  const t = normaliseTier(tierId)
  return t === 'rocket_gold' || t === 'rocket_platinum'
}

export function isGear6Endpoint(tierId: string): boolean {
  // All tiers that reach Gear 6 complete here (Silver, Gold, Platinum, Rocket)
  return true
}

// ── FINAL HANDOFF FOR SESSION COMPLETION ──────────────────────

export function buildSessionComplete(
  pkg:    DistributionPackage,
  intent: IntentDefinition
): Record<string, unknown> {
  return {
    productTitle:    pkg.listing.title,
    priceZar:        pkg.listing.priceZar,
    format:          pkg.listing.format,
    listing:         pkg.listing,
    socialPosts:     pkg.socialPosts,
    launchDate:      pkg.launchDate,
    targetAudience:  intent.targetAudience,
    promiseStatement:intent.promiseStatement,
    priceRecommended:intent.priceRecommended,
  }
}
