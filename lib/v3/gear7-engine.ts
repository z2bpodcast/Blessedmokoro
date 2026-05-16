// ============================================================
// Z2B 4M V3 — GEAR 7: MULTI-PLATFORM DISTRIBUTION ENGINE
// File: lib/v3/gear7-engine.ts
// Silver (Electric) → seller kits per platform
// Gold/Platinum (Rocket) → auto-distribute via n8n
// ============================================================

import { orchestrate } from '@/lib/v3/orchestration-router'

// ── PLATFORM DEFINITIONS ─────────────────────────────────────

export interface Platform {
  id:          string
  name:        string
  emoji:       string
  region:      string
  currency:    string
  audience:    string
  maxTitle:    number
  maxDesc:     number
  hasTags:     boolean
  listingUrl:  string
  setupSteps:  string[]
}

export const PLATFORMS: Platform[] = [
  {
    id:         'selar',
    name:       'Selar',
    emoji:      '🌍',
    region:     'Africa-first · ZAR · NGN · GHS',
    currency:   'ZAR / NGN',
    audience:   'African digital product buyers',
    maxTitle:   100,
    maxDesc:    500,
    hasTags:    true,
    listingUrl: 'https://selar.co',
    setupSteps: [
      'Go to selar.co and create a free account',
      'Click "Sell" → "Add Product" → "Digital Download"',
      'Paste your title and description below',
      'Upload your product PDF/file',
      'Set your price in ZAR or NGN',
      'Add your tags and publish',
    ],
  },
  {
    id:         'gumroad',
    name:       'Gumroad',
    emoji:      '💜',
    region:     'Global · USD · 190+ countries',
    currency:   'USD',
    audience:   'Global digital product buyers',
    maxTitle:   100,
    maxDesc:    3000,
    hasTags:    false,
    listingUrl: 'https://gumroad.com',
    setupSteps: [
      'Go to gumroad.com and create a free account',
      'Click "New Product" → select "Digital Product"',
      'Paste your title and description below',
      'Upload your product file',
      'Set your price in USD (or 0 for pay-what-you-want)',
      'Click "Publish" — your link is live instantly',
    ],
  },
  {
    id:         'payhip',
    name:       'Payhip',
    emoji:      '📦',
    region:     'International · Multi-currency',
    currency:   'USD / GBP / EUR',
    audience:   'International buyers across 200+ countries',
    maxTitle:   120,
    maxDesc:    2000,
    hasTags:    true,
    listingUrl: 'https://payhip.com',
    setupSteps: [
      'Go to payhip.com and sign up free',
      'Click "Add Product" → "Digital Download"',
      'Paste your title and description below',
      'Upload your product file',
      'Set your price and currency',
      'Your product page is live — share the link',
    ],
  },
  {
    id:         'whatsapp',
    name:       'WhatsApp Business',
    emoji:      '💬',
    region:     'Direct · Any currency · Any country',
    currency:   'Any',
    audience:   'Your personal network and community',
    maxTitle:   80,
    maxDesc:    1000,
    hasTags:    false,
    listingUrl: 'https://wa.me',
    setupSteps: [
      'Copy the WhatsApp sales message below',
      'Open WhatsApp Business (or regular WhatsApp)',
      'Share to your broadcast list, status, or groups',
      'Include your payment link (PayFast, Payhip, Selar)',
      'Pin the message in relevant group chats',
    ],
  },
]

// ── TYPES ─────────────────────────────────────────────────────

export interface PlatformKit {
  platformId:   string
  platformName: string
  emoji:        string
  title:        string
  description:  string
  tags:         string[]
  price:        string
  whatsappMsg?: string
  setupSteps:   string[]
}

export interface Gear7Output {
  productTitle: string
  kits:         PlatformKit[]
  isRocket:     boolean
  tokensUsed:   number
}

// ── ENGINE ─────────────────────────────────────────────────────

export async function runGear7(params: {
  productTitle:    string
  productDesc:     string
  format:          string
  price:           number
  currency:        string
  targetAudience:  string
  tierId:          string
  gear6Listing?:   Record<string, unknown>
}): Promise<{ output: Gear7Output | null; error: string | null }> {

  const isRocket = ['gold', 'platinum'].includes(params.tierId)

  const platformList = PLATFORMS.map(p =>
    `${p.emoji} ${p.name}: ${p.region} | max title: ${p.maxTitle} chars | max desc: ${p.maxDesc} chars${p.hasTags ? ' | include tags' : ''}`
  ).join('\n')

  const prompt = `You are the Z2B 4M Distribution Engine — the world's best digital product launch copywriter.

PRODUCT TO DISTRIBUTE:
Title: ${params.productTitle}
Format: ${params.format}
Price: ${params.currency}${params.price}
Target audience: ${params.targetAudience}
${params.productDesc ? `Description: ${params.productDesc.slice(0, 500)}` : ''}

PLATFORMS TO LIST ON:
${platformList}

YOUR TASK:
Write platform-optimised listings for each platform. Each listing must:
1. Respect the character limits per platform
2. Use language that converts on that specific platform
3. Be culturally appropriate for that platform's audience
4. Include social proof language where relevant
5. Drive urgency without being salesy

For WhatsApp: write a personal, conversational broadcast message (not a formal listing)
For Gumroad/Payhip/Selar: write a professional product page description

Respond ONLY with valid JSON:
{
  "kits": [
    {
      "platformId": "selar",
      "title": "Optimised title for Selar (max 100 chars)",
      "description": "Compelling product description for Selar (max 500 chars)",
      "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
      "price": "R${params.price}",
      "whatsappMsg": null
    },
    {
      "platformId": "gumroad",
      "title": "Optimised title for Gumroad (max 100 chars)",
      "description": "Rich product description for Gumroad (max 3000 chars) — use line breaks for readability",
      "tags": [],
      "price": "$${Math.round(params.price / 18)}",
      "whatsappMsg": null
    },
    {
      "platformId": "payhip",
      "title": "Optimised title for Payhip (max 120 chars)",
      "description": "Professional product description for Payhip (max 2000 chars)",
      "tags": ["tag1", "tag2"],
      "price": "$${Math.round(params.price / 18)}",
      "whatsappMsg": null
    },
    {
      "platformId": "whatsapp",
      "title": "Short hook for WhatsApp (max 80 chars)",
      "description": "WhatsApp broadcast message — conversational, personal, includes payment link placeholder",
      "tags": [],
      "price": "R${params.price}",
      "whatsappMsg": "Full WhatsApp message including call to action and payment link placeholder [PAYMENT_LINK]"
    }
  ]
}`

  try {
    const result = await orchestrate('distribution_strategy', prompt)
    if (result.error || !result.content) {
      return { output: null, error: result.error ?? 'Distribution failed' }
    }

    const data = JSON.parse(result.content.replace(/```json|```/g, '').trim())
    const kits  = (data.kits ?? []).map((kit: any) => {
      const platform = PLATFORMS.find(p => p.id === kit.platformId)
      return {
        platformId:   kit.platformId,
        platformName: platform?.name ?? kit.platformId,
        emoji:        platform?.emoji ?? '📦',
        title:        kit.title ?? '',
        description:  kit.description ?? '',
        tags:         kit.tags ?? [],
        price:        kit.price ?? '',
        whatsappMsg:  kit.whatsappMsg ?? null,
        setupSteps:   platform?.setupSteps ?? [],
      }
    })

    return {
      output: {
        productTitle: params.productTitle,
        kits,
        isRocket,
        tokensUsed:   result.tokensUsed ?? 0,
      },
      error: null,
    }

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('[gear7-engine]', msg)
    return { output: null, error: 'Could not generate distribution package. Please try again.' }
  }
}
