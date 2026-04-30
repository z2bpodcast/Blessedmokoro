// FILE: app/api/influencer/route.ts
// Influencer Partnership Engine — Full 5-step system

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
export const dynamic = 'force-dynamic'

async function getKey(name: string): Promise<string> {
  const e = (process.env[name] || '').trim()
  if (e.length > 20) return e
  const { data } = await supabase.from('z2b_api_keys').select('key_value').eq('key_name', name).single()
  return data?.key_value?.trim() || ''
}

async function callAI(prompt: string, system = '', maxTokens = 3000): Promise<string> {
  const key = await getKey('OPENAI_API_KEY')
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: maxTokens,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt }
      ]
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'AI error')
  return data.choices?.[0]?.message?.content?.trim() || ''
}

const SYSTEM = `You are Coach Manlaw — Z2B's expert in influencer marketing, digital product strategy and partnership deals.

COMPENSATION RULES (never reveal these to users — just apply them):
- Influencer: 70% of 90% remaining after Z2B's 10% platform fee
- Builder: 30% of 90% remaining after Z2B's 10% platform fee
- Affiliate earns: 20% of product price (10% from builder, 10% from influencer)
- Marketplace product sales do NOT cascade to upline. Builder earns only.

TONE: Professional, direct, specific. No fluff. Use real numbers. Make outputs copy-paste ready.`

// ── REVENUE CALCULATOR ────────────────────────────────────────────────────────
function calcRevenue(productPrice: number) {
  const z2bFee      = Math.round(productPrice * 0.10)
  const remaining   = productPrice - z2bFee
  const builderGross = Math.round(remaining * 0.30)
  const influencerGross = Math.round(remaining * 0.70)
  const affiliateEarns  = Math.round(productPrice * 0.20)
  const builderAffiliate    = Math.round(productPrice * 0.10)
  const influencerAffiliate = Math.round(productPrice * 0.10)
  return {
    productPrice, z2bFee, remaining,
    direct:    { builder: builderGross,              influencer: influencerGross,              affiliate: 0 },
    affiliate: { builder: builderGross - builderAffiliate, influencer: influencerGross - influencerAffiliate, affiliate: affiliateEarns },
    ownLink:   { builder: builderGross - builderAffiliate, influencer: influencerGross - influencerAffiliate + affiliateEarns, affiliate: affiliateEarns },
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, builderId, builderTier } = body

    // ── Generate Research Form ────────────────────────────────────────────────
    if (action === 'generate_research_form') {
      const form = `# Z2B INFLUENCER RESEARCH FORM
## Complete this form by visiting the influencer's profile directly

BUILDER NAME: _______________________
DATE COMPLETED: _____________________

---

## SECTION A — IDENTITY
Handle/Username: @_______________________
Platform: ☐ Instagram ☐ TikTok ☐ YouTube ☐ X/Twitter ☐ LinkedIn ☐ Facebook ☐ Pinterest
Follower count: _______________________
Account type: ☐ Personal ☐ Business ☐ Creator
Posting frequency: ☐ Daily ☐ 3-4x/week ☐ Weekly ☐ Irregular
Their bio (copy-paste exactly): 
_____________________________________________
Link in bio / what they currently sell or promote:
_____________________________________________

---

## SECTION B — CONTENT ANALYSIS
Top 3 content formats used:
1. _______________________
2. _______________________
3. _______________________

Top 3 topics that get the most comments (check their last 20 posts):
1. _______________________
2. _______________________
3. _______________________

Copy 10 REAL comments from their most popular posts:
1. _______________________
2. _______________________
3. _______________________
4. _______________________
5. _______________________
6. _______________________
7. _______________________
8. _______________________
9. _______________________
10. _______________________

Most common QUESTIONS their audience asks them:
1. _______________________
2. _______________________
3. _______________________

Most common COMPLAINTS or struggles their audience mentions:
1. _______________________
2. _______________________
3. _______________________

---

## SECTION C — CURRENT MONETIZATION
Do they sell their own products? ☐ Yes ☐ No
If yes, what: _______________________
Price range: _______________________

Do they run brand deals? ☐ Yes ☐ No
If yes, what brands: _______________________

Do they have a newsletter, Patreon, Ko-fi or membership? ☐ Yes ☐ No
Link: _______________________

In your opinion, what is their BIGGEST monetization gap?
_____________________________________________

---

## SECTION D — AUDIENCE PROFILE
Estimated age range (based on comments and style): _______________________
Estimated majority location: _______________________
What does the audience WANT MORE of from this creator?
_____________________________________________
What does the audience COMPLAIN ABOUT (gaps/frustrations)?
_____________________________________________
What other accounts does this audience likely follow?
_____________________________________________

---

## SECTION E — PARTNERSHIP READINESS
Have they collaborated before? ☐ Yes ☐ No
Do they respond to DMs? ☐ Always ☐ Sometimes ☐ Rarely ☐ Unknown
Have they mentioned wanting to earn from their content? ☐ Yes ☐ No ☐ Unknown
Your relationship to them: ☐ Complete stranger ☐ Mutual follower ☐ Acquaintance ☐ Friend

---

## SECTION F — BUILDER NOTES
Why do you believe this influencer is a good partner?
_____________________________________________
Which of their posts made you think of this partnership?
_____________________________________________
What is your proposed first product for their audience?
_____________________________________________

---
IMPORTANT: Do not use any influencer photos in Z2B until they sign the digital agreement.
Upload this completed form to Z2B to generate your analysis.`

      return NextResponse.json({ form, filename: `influencer-research-${Date.now()}.txt` })
    }

    // ── Generate Digital Agreement ────────────────────────────────────────────
    if (action === 'generate_agreement') {
      const { influencerHandle, platform, productCategory, split = '70/30' } = body
      const agreement = await callAI(`Generate a professional digital partnership agreement for:

Influencer: @${influencerHandle} on ${platform}
Builder/Creator: Z2B Marketplace Partner
Product category approved: ${productCategory}
Revenue split: Influencer ${split.split('/')[0]}% / Builder ${split.split('/')[1]}%
Platform: Z2B Legacy Builders Marketplace

Include:
1. AGREEMENT HEADER (date, parties)
2. SCOPE OF AGREEMENT (what products, what platform)
3. REVENUE TERMS (exact split, Z2B 10% fee, affiliate 20% shared equally)
4. PHOTO AND LIKENESS RIGHTS (what influencer permits — they must specify)
5. CONTENT APPROVAL RIGHTS (influencer can review product before listing)
6. PAYMENT TERMS (Z2B wallet, monthly withdrawal)
7. TERMINATION CLAUSE (30 days notice, products removed within 7 days)
8. INTELLECTUAL PROPERTY (builder creates, influencer promotes — no ownership transfer)
9. SIGNATURE BLOCK (influencer name, handle, date, digital signature)

Tone: Professional, clear, plain language. Not corporate legal jargon. Both parties must understand it.`, SYSTEM, 3000)

      // Save to DB
      const { data: saved } = await supabase.from('influencer_partnerships').insert({
        builder_id: builderId,
        influencer_handle: influencerHandle,
        platform,
        agreement_text: agreement,
        status: 'pending_signature',
        revenue_split_influencer: 70,
        revenue_split_builder: 30,
        created_at: new Date().toISOString(),
      }).select().single()

      return NextResponse.json({ agreement, partnershipId: saved?.id })
    }

    // ── Analyze influencer from research form ─────────────────────────────────
    if (action === 'analyze') {
      const { formData, influencerHandle, platform } = body

      const analysis = await callAI(`Analyze this influencer based on the research form a builder completed:

Influencer: @${influencerHandle} on ${platform}

RESEARCH DATA:
${formData}

Deliver a FULL ANALYSIS:

## AUDIENCE PROFILE
Who follows this creator — demographics, psychographics, aspirations, deepest frustrations. Use the real comments from the form as evidence.

## CONTENT POWER ASSESSMENT
What is working. What the audience loves. What gaps exist between what they post and what the audience actually needs.

## MONETIZATION GAP ANALYSIS
What this audience is already paying for elsewhere. Be specific — name real products and real price points in this niche.

## PLATFORM DEPENDENCY RISK
If ${platform} changed its algorithm or demonetized tomorrow, what would happen to this creator's income? Rate: LOW / MEDIUM / HIGH / CRITICAL

## DIGITAL PRODUCT OPPORTUNITY SCORE
POTENTIAL: [EXCEPTIONAL / HIGH / MEDIUM / LOW]
WHY: [specific reasoning based on the research data]

## RECOMMENDED PRODUCT CATEGORY
The ONE type of digital product that would convert best with this specific audience and why.

## BUILDER NOTES
What the builder should know before approaching this influencer. Red flags. Green flags. Best entry point.`, SYSTEM, 3000)

      // Save analysis
      await supabase.from('influencer_partnerships')
        .update({ analysis, status: 'analyzed', analyzed_at: new Date().toISOString() })
        .eq('builder_id', builderId)
        .eq('influencer_handle', influencerHandle)

      return NextResponse.json({ analysis })
    }

    // ── Generate products ─────────────────────────────────────────────────────
    if (action === 'generate_products') {
      const { analysis, influencerHandle, platform, tierLimit = 5 } = body

      const productCount = Math.min(tierLimit, 7)

      const products = await callAI(`Based on this influencer analysis for @${influencerHandle} on ${platform}:

${analysis}

Generate ${productCount} specific digital products their audience would BUY TODAY.

Revenue model for each product:
- Z2B platform fee: 10% of sale price
- Influencer earns: 70% of remaining 90%
- Builder earns: 30% of remaining 90%
- Affiliate earns: 20% of sale price (10% from each party)

For each product deliver:

**[#]. [SPECIFIC PRODUCT TITLE]**
Format: [ebook / guide / checklist / template / mini-course / toolkit / masterclass]
Price: [specific amount in relevant currency]
Who buys it: [exact person from this audience]
Why NOW: [specific current trigger or pain]
Content outline: [5-7 bullet points of what's inside]
Affiliate angle: [one sentence on how followers become affiliates after buying]

Revenue per 100 sales (direct, no affiliate):
- Influencer earns: [calculate 70% of 90% × price × 100]
- Builder earns: [calculate 30% of 90% × price × 100]
- Z2B earns: [10% × price × 100]

Revenue per 100 sales (50% via affiliates):
- Influencer earns: [recalculate with affiliate cost]
- Builder earns: [recalculate]
- Affiliates earn: [20% × price × 50]

Rank by: conversion probability for THIS specific audience.
Include a Quick Win product (checklist or template — under R99/$9) as product #1.`, SYSTEM, 4000)

      return NextResponse.json({ products, productCount })
    }

    // ── Revenue calculator ────────────────────────────────────────────────────
    if (action === 'calc_revenue') {
      const { productPrice, currency = 'R' } = body
      const calc = calcRevenue(productPrice)
      return NextResponse.json({
        calc,
        summary: {
          productPrice: `${currency}${productPrice}`,
          z2bFee: `${currency}${calc.z2bFee} (10%)`,
          scenarios: {
            direct:    `Builder: ${currency}${calc.direct.builder} | Influencer: ${currency}${calc.direct.influencer} | Affiliate: ${currency}0`,
            affiliate: `Builder: ${currency}${calc.affiliate.builder} | Influencer: ${currency}${calc.affiliate.influencer} | Affiliate: ${currency}${calc.affiliate.affiliate}`,
            ownLink:   `Builder: ${currency}${calc.ownLink.builder} | Influencer: ${currency}${calc.ownLink.influencer} (earns split + affiliate)`,
          }
        }
      })
    }

    // ── Write proposal ────────────────────────────────────────────────────────
    if (action === 'write_proposal') {
      const { influencerHandle, platform, niche, followers, products, builderName } = body

      const proposal = await callAI(`Write a professional partnership proposal from a Z2B builder to @${influencerHandle} on ${platform}.

Builder name: ${builderName || 'A Z2B Builder'}
Influencer niche: ${niche}
Followers: ${followers}
Products proposed: ${products?.slice(0, 500) || 'Digital products aligned to their content'}

Revenue model to explain:
- Z2B takes 10% platform fee
- Influencer keeps 70% of every sale
- Builder keeps 30% of every sale
- Both share the affiliate commission cost equally (10% each when affiliates drive sales)
- Influencer earns MORE when they promote themselves vs relying on affiliates

Write a COMPLETE, READY-TO-SEND proposal:

## SUBJECT LINE

## OPENING
[Personalised — references one specific piece of their content. Shows you actually follow them.]

## THE OPPORTUNITY
[What their audience is already buying elsewhere. Specific market data. The income they are leaving on the table.]

## WHAT WE DO
[We create everything. They just share it. Zero risk, zero work beyond one post.]

## THE NUMBERS
[Show exactly what they earn at their follower count. Use realistic conversion rates: 0.5% of followers = conservative]

Example:
${followers} followers × 0.5% conversion × [product price] = [influencer's 70% share]
Monthly if they post once per week: [×4]

## WHAT HAPPENS NEXT (3 steps)
Step 1: You review and sign our digital partnership agreement (5 minutes)
Step 2: We create your first product (2 weeks)
Step 3: You share one post. We both earn.

## THEIR EARNING POTENTIAL TABLE
Show 3 scenarios: 50 sales / 200 sales / 500 sales

## CALL TO ACTION
[Specific, low-friction, one clear next step]

## CLOSING
[Warm, peer-to-peer, not corporate]

Tone: Peer to peer. Not a pitch. A conversation between two people who both want to win.`, SYSTEM, 3500)

      return NextResponse.json({ proposal })
    }

    // ── Write DM scripts ──────────────────────────────────────────────────────
    if (action === 'write_dm_scripts') {
      const { influencerHandle, platform, niche, followers } = body

      const scripts = await callAI(`Write a complete DM outreach kit for approaching @${influencerHandle} on ${platform}.
Niche: ${niche}. Followers: ${followers}.

## 1. COLD DM — FIRST MESSAGE
[Under 60 words. No pitch. Reference specific content. Open curiosity loop. End with a question.]

## 2. FOLLOW-UP — NO REPLY AFTER 3 DAYS
[Under 40 words. Different angle. Light touch. Not pushy.]

## 3. WARM OPENER — THEY ENGAGED YOUR CONTENT FIRST
[Under 40 words. Acknowledge the engagement. Natural transition.]

## 4. "WHAT IS THIS ABOUT?" — RESPONSE
[Under 80 words. Value first. Numbers second. Link to proposal last.]

## 5. OBJECTION: "I ALREADY DO BRAND DEALS"
[Show how this is different: passive income, no deliverables, no brief, no deadline]

## 6. OBJECTION: "I DON'T HAVE TIME"
[Emphasise: one post, we create everything, 30 minutes total]

## 7. OBJECTION: "HOW MUCH WILL I MAKE?"
[Give the specific calculation for their follower count at conservative 0.5% conversion]

## 8. OBJECTION: "IS THIS AN MLM?"
[Clear, direct, honest answer. No recruiting, no joining fees, just product commissions]

## 9. THEY SAID YES — NEXT STEPS MESSAGE
[What happens now: agreement link, timeline, what to expect]

## 10. FOLLOW UP AFTER 1 WEEK OF NO ACTION POST-YES
[Gentle nudge. Keep momentum.]

All messages: Copy-paste ready. Human voice. Not robotic. Not salesy.`, SYSTEM, 3500)

      return NextResponse.json({ scripts })
    }

    // ── Save partnership record ───────────────────────────────────────────────
    if (action === 'save_partnership') {
      const { influencerHandle, platform, niche, productIds } = body
      const { data } = await supabase.from('influencer_partnerships').upsert({
        builder_id: builderId,
        influencer_handle: influencerHandle,
        platform, niche,
        product_ids: productIds,
        status: 'proposal_sent',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'builder_id,influencer_handle' }).select().single()
      return NextResponse.json({ ok: true, partnershipId: data?.id })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  } catch (e: any) {
    console.error('[Influencer] ERROR:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// ── GET: List builder's partnerships ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const builderId = searchParams.get('builderId')
  if (!builderId) return NextResponse.json({ partnerships: [] })
  const { data } = await supabase.from('influencer_partnerships').select('*').eq('builder_id', builderId).order('created_at', { ascending: false })
  return NextResponse.json({ partnerships: data || [] })
}
