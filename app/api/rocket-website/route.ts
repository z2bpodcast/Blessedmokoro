// FILE: app/api/rocket-website/route.ts
// 🌐 Rocket Website Builder — Gold + Platinum only
// AI builds complete product website. Builder pays domain + presses Publish.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

async function getKey(name: string): Promise<string> {
  const fromEnv = (process.env[name] || '').trim()
  if (fromEnv.length > 20) return fromEnv
  const { data } = await supabase.from('z2b_api_keys').select('key_value').eq('key_name', name).single()
  return data?.key_value?.trim() || ''
}

async function callOpenAI(messages: any[], maxTokens = 4000): Promise<string> {
  const key = await getKey('OPENAI_API_KEY')
  if (!key) throw new Error('No OpenAI key')
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: maxTokens, messages }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${JSON.stringify(data).slice(0,200)}`)
  return data.choices?.[0]?.message?.content?.trim() || ''
}

// ── STAGE 1: Website Strategy ─────────────────────────────────────────────────
async function buildWebsiteStrategy(product: any): Promise<any> {
  const response = await callOpenAI([
    { role: 'system', content: 'You are a world-class conversion copywriter and web strategist. Respond ONLY in valid JSON.' },
    { role: 'user', content: `Create a complete website strategy for this digital product:

Product: "${product.title}"
Subtitle: "${product.subtitle}"
Description: "${product.description}"
Price: ${product.retail_price} ZAR
Target Market: ${product.target_market}
Transformation: "${product.transformation}"

Return:
{
  "domain_suggestions": ["3 short memorable .com domain suggestions that match the product"],
  "tagline": "Power tagline for the website hero",
  "hero_headline": "Main headline that stops the scroll",
  "hero_subheadline": "Subheadline that deepens the hook",
  "pain_section_headline": "Section headline for the pain/problem",
  "pain_points": ["5 specific pain points the buyer feels right now"],
  "solution_headline": "How this product solves it",
  "benefits": ["6 specific benefits with outcomes not features"],
  "who_its_for": ["5 specific descriptions of who this is for"],
  "what_inside": ["5 highlights of what's inside the product"],
  "social_proof_prompts": ["3 testimonial prompts to send buyers"],
  "faq": [{"q": "question", "a": "answer"}, ...5 FAQs],
  "cta_primary": "Primary buy button text",
  "cta_urgency": "Urgency/scarcity line under the buy button",
  "price_justification": "Why this price is actually a bargain",
  "guarantee": "Money-back or satisfaction guarantee statement",
  "seo_title": "SEO page title (under 60 chars)",
  "seo_description": "Meta description (under 155 chars)",
  "seo_keywords": ["10 keywords for this product"]
}` }
  ], 2500)

  const clean = response.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

// ── STAGE 2: Full HTML Website Generation ────────────────────────────────────
async function generateWebsite(product: any, strategy: any): Promise<string> {
  const price = product.retail_price || 199
  const split = Math.round(price * 0.95)

  const response = await callOpenAI([
    { role: 'system', content: `You are an expert web developer and conversion designer. 
Generate a COMPLETE, PRODUCTION-READY single-page HTML website that converts visitors into buyers.
The HTML must be:
- Beautiful, modern, mobile-first
- Complete with embedded CSS (no external dependencies except Google Fonts)
- High-converting sales page structure
- Dark/purple theme with gold accents (brand: #4C1D95 purple, #D4AF37 gold, #0D0820 dark bg)
- Return ONLY the complete HTML. No explanation. No markdown.` },
    { role: 'user', content: `Build a complete sales website for:

PRODUCT: ${product.title}
SUBTITLE: ${product.subtitle}
PRICE: R${price}
TARGET: ${product.target_market}

STRATEGY DATA:
${JSON.stringify(strategy, null, 2)}

BUILD THIS EXACT STRUCTURE:
1. NAVIGATION: Logo (product name) + Buy Now button
2. HERO: Big headline + subheadline + hero CTA button + product mockup box
3. PAIN SECTION: "Does this sound familiar?" + 5 pain points with ❌ icons
4. SOLUTION: How this product fixes everything
5. BENEFITS: 6 benefit cards with ✅ icons and outcomes
6. WHAT'S INSIDE: Product contents preview
7. WHO IT'S FOR: 5 avatar descriptions
8. SOCIAL PROOF: 3 testimonial placeholders (styled, with "[Name]" placeholder)
9. PRICING: Price box + what they get + buy button + payment options (Yoco/EFT/Bank)
10. FAQ: 5 questions and answers
11. GUARANTEE: Trust section
12. FINAL CTA: Last buy button
13. FOOTER: Copyright + contact (info@[domain].com)

PAYMENT INSTRUCTIONS IN THE SITE:
- Yoco link: [YOCO_PAYMENT_LINK] (placeholder)
- EFT: Nedbank · Acc: 1318257727 · Zero2Billionaires Amavuladlela Pty Ltd · Ref: [Buyer Name]
- WhatsApp proof: 0774901639

Make it STUNNING. Mobile first. Conversion-optimised. Complete HTML only.` }
  ], 4000)

  return response
}

// ── STAGE 3: Promotion Strategy ──────────────────────────────────────────────
async function buildPromotionStrategy(product: any, strategy: any): Promise<any> {
  const response = await callOpenAI([
    { role: 'system', content: 'You are a digital marketing expert specialising in organic and paid promotion. Respond ONLY in valid JSON.' },
    { role: 'user', content: `Build a complete promotion strategy for:

Product: "${product.title}"
Target Market: ${product.target_market}
Price: R${product.retail_price}
Website: [their domain]

Return:
{
  "seo_strategy": {
    "primary_keyword": "main keyword to rank for",
    "secondary_keywords": ["5 secondary keywords"],
    "blog_post_ideas": ["3 blog post titles that drive organic traffic"],
    "google_my_business_tips": ["3 tips if targeting local market"]
  },
  "google_ads": {
    "headline_1": "Google ad headline 1 (30 chars max)",
    "headline_2": "Google ad headline 2 (30 chars max)", 
    "headline_3": "Google ad headline 3 (30 chars max)",
    "description_1": "Ad description 1 (90 chars max)",
    "description_2": "Ad description 2 (90 chars max)",
    "keywords_to_bid": ["10 keywords to bid on"],
    "negative_keywords": ["5 negative keywords to exclude"],
    "budget_suggestion": "Daily budget recommendation in ZAR"
  },
  "facebook_ads": {
    "primary_text": "Facebook ad primary text (hook + value + CTA)",
    "headline": "Facebook ad headline",
    "description": "Facebook ad description",
    "audience_targeting": ["5 specific Facebook audience targeting suggestions"],
    "ad_image_description": "Description of ideal ad image to create"
  },
  "whatsapp_campaign": {
    "broadcast_1": "Day 1 launch broadcast",
    "broadcast_2": "Day 3 follow up",
    "broadcast_3": "Day 7 final push",
    "status_ideas": ["5 WhatsApp status ideas to post daily"]
  },
  "tiktok_strategy": {
    "content_hooks": ["5 TikTok video hooks (first 3 seconds)"],
    "hashtags": ["15 relevant hashtags"],
    "posting_schedule": "Recommended posting times"
  },
  "email_sequence": [
    {"day": 1, "subject": "email subject", "preview": "email preview text", "purpose": "awareness"},
    {"day": 3, "subject": "email subject", "preview": "email preview text", "purpose": "value"},
    {"day": 5, "subject": "email subject", "preview": "email preview text", "purpose": "close"},
    {"day": 7, "subject": "email subject", "preview": "email preview text", "purpose": "urgency"}
  ],
  "content_calendar": [
    {"week": 1, "focus": "awareness", "content_ideas": ["3 content ideas"]},
    {"week": 2, "focus": "education", "content_ideas": ["3 content ideas"]},
    {"week": 3, "focus": "social proof", "content_ideas": ["3 content ideas"]},
    {"week": 4, "focus": "close", "content_ideas": ["3 content ideas"]}
  ],
  "influencer_outreach": "Template message to send to micro-influencers in this niche",
  "launch_week_plan": {
    "day1": "action",
    "day2": "action",
    "day3": "action",
    "day4": "action",
    "day5": "action",
    "day6": "action",
    "day7": "action"
  }
}` }
  ], 3000)

  const clean = response.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

// ── MAIN HANDLER ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, userId, builderTier, productId } = body

    // Gold+ only
    const tierRank: Record<string,number> = { free:0,starter:1,bronze:2,copper:3,silver:4,gold:5,platinum:6 }
    if ((tierRank[builderTier] || 0) < 5) {
      return NextResponse.json({ error: 'Gold or Platinum tier required for website builder' }, { status: 403 })
    }

    // Get product from DB
    const { data: product, error: prodErr } = await supabase
      .from('rocket_products').select('*').eq('id', productId).eq('builder_id', userId).single()
    if (prodErr || !product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    // ── Build website ──────────────────────────────────────────────────────
    if (action === 'build_website') {
      // Stage 1: Strategy
      const strategy = await buildWebsiteStrategy(product)

      // Stage 2: HTML
      const websiteHTML = await generateWebsite(product, strategy)

      // Stage 3: Promotion (Platinum only — Gold gets basic)
      let promotion = null
      if (builderTier === 'platinum') {
        promotion = await buildPromotionStrategy(product, strategy)
      }

      // Save to DB
      const { data: saved } = await supabase.from('rocket_websites').insert({
        product_id:    productId,
        builder_id:    userId,
        builder_tier:  builderTier,
        title:         product.title,
        strategy:      strategy,
        html_content:  websiteHTML,
        promotion:     promotion,
        status:        'draft',
        domain:        null,
        created_at:    new Date().toISOString(),
      }).select().single()

      return NextResponse.json({
        websiteId:    saved?.id,
        strategy,
        html:         websiteHTML,
        promotion,
        domainSuggestions: strategy.domain_suggestions || [],
      })
    }

    // ── Save domain choice ─────────────────────────────────────────────────
    if (action === 'save_domain') {
      const { websiteId, domain } = body
      await supabase.from('rocket_websites').update({ domain, status:'ready' }).eq('id', websiteId)
      return NextResponse.json({ ok: true })
    }

    // ── Publish (mark as live) ─────────────────────────────────────────────
    if (action === 'publish') {
      const { websiteId, domain } = body
      await supabase.from('rocket_websites').update({ status:'live', domain, published_at: new Date().toISOString() }).eq('id', websiteId)
      return NextResponse.json({ ok: true, liveUrl: `https://${domain}` })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  } catch (e: any) {
    console.error('[RocketWebsite] ERROR:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
