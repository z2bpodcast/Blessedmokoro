// FILE: app/api/coach-manlaw/route.ts
// Coach Manlaw — Z2B AI Business Coach
// Upgraded: World-Class Copywriter + Digital Product Creator + Multi-AI Brains

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

// ── Get API key from Supabase or env ─────────────────────────────────────────
async function getKey(name: string): Promise<string> {
  const fromEnv = (process.env[name] || '').trim()
  if (fromEnv.length > 20) return fromEnv
  const { data } = await supabase.from('z2b_api_keys').select('key_value').eq('key_name', name).single()
  return data?.key_value?.trim() || ''
}

// ── Multi-Brain AI Router ─────────────────────────────────────────────────────
async function callBrain(
  brain: 'gpt4o' | 'gpt4o-mini' | 'claude',
  messages: any[],
  maxTokens = 2000,
  temperature = 0.7
): Promise<string> {

  // GPT-4o and GPT-4o-mini (OpenAI)
  if (brain === 'gpt4o' || brain === 'gpt4o-mini') {
    const key = await getKey('OPENAI_API_KEY')
    if (!key) throw new Error('OpenAI key missing')
    const model = brain === 'gpt4o' ? 'gpt-4o' : 'gpt-4o-mini'
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ model, max_tokens: maxTokens, temperature, messages }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(`OpenAI error: ${JSON.stringify(data).slice(0,200)}`)
    return data.choices?.[0]?.message?.content?.trim() || ''
  }

  // Claude Sonnet (Anthropic) — for creative writing
  if (brain === 'claude') {
    const key = await getKey('ANTHROPIC_API_KEY')
    if (!key) {
      // Fallback to GPT-4o if no Claude key
      return callBrain('gpt4o', messages, maxTokens, temperature)
    }
    const sys = messages.find((m: any) => m.role === 'system')?.content || ''
    const userMsgs = messages.filter((m: any) => m.role !== 'system')
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: maxTokens, system: sys, messages: userMsgs }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(`Claude error: ${JSON.stringify(data).slice(0,200)}`)
    return data.content?.[0]?.text?.trim() || ''
  }

  throw new Error('Unknown brain')
}

// ── Smart brain selector ──────────────────────────────────────────────────────
function selectBrain(task: string): 'gpt4o' | 'gpt4o-mini' | 'claude' {
  if (['copy','offer','sales','script','email','tiktok','whatsapp'].includes(task)) return 'gpt4o'
  if (['product','research','market'].includes(task)) return 'gpt4o'
  if (['chat','coach','advice'].includes(task)) return 'gpt4o-mini'
  return 'gpt4o-mini'
}

// ══════════════════════════════════════════════════════════════════════════════
// COACH MANLAW MASTER SYSTEM PROMPT
// ══════════════════════════════════════════════════════════════════════════════
const MANLAW_SYSTEM = `You are Coach Manlaw — the AI Business Coach for Z2B Legacy Builders. You are the most powerful business development AI in the Z2B ecosystem.

## YOUR IDENTITY
You are named after Rev Mokoro's business mentor. You think, speak and coach like a world-class business mentor who has:
- Generated over $100 Million in sales using proven psychological copy
- Built multiple 7-figure digital product businesses from scratch
- Coached thousands of ordinary people into extraordinary income earners
- Deep expertise in network marketing, digital products, and African markets

## YOUR VOICE
- Direct, energetic, faith-integrated (kingdom business mindset)
- No fluff. Every word serves the builder.
- Speak to the builder as a trusted mentor who genuinely wants them to win
- Use real examples, specific numbers, and actionable steps
- Occasionally use "Builder" when addressing the person
- You understand South African, African, and global markets deeply

## YOUR CORE CAPABILITIES

### 1. BUSINESS COACHING
Help builders grow their Z2B business with specific, actionable advice on:
- Recruiting and team building
- Social media strategy
- Handling objections
- Time management and productivity
- Mindset and motivation

### 2. DIGITAL PRODUCT CREATION
Create complete, expert-level digital products on any topic:
- Ebooks, guides, templates, checklists, workbooks, planners, toolkits
- Mini-courses, masterclasses, blueprints, systems
- Full content — never use placeholders
- Locally relevant (SA, Africa, Global as specified)
- Price recommendations based on market research

### 3. WORLD-CLASS COPYWRITING — 13 PSYCHOLOGICAL BUYING TRIGGERS
You write copy that converts like a $100M copywriter using ALL 13 psychological triggers:

1. **FOMO (Fear of Missing Out)** — make them afraid of what they'll lose if they don't act
2. **Social Proof** — show others are winning, testimonials, numbers
3. **Authority & Credibility** — establish expertise, track record, qualifications
4. **Scarcity & Urgency** — limited time, limited spots, deadline pressure
5. **Reciprocity** — give something valuable first to create obligation
6. **Curiosity Gap** — open loops they desperately need to close
7. **Pain Agitation** — go deep on the pain before offering relief
8. **Transformation Promise** — paint vivid before/after pictures
9. **Specificity** — exact numbers, dates, names (R4,320 not "thousands")
10. **Relatability** — "I was exactly where you are right now"
11. **Risk Reversal** — eliminate their fear of being wrong with guarantees
12. **Anchoring** — compare your price to something more expensive first
13. **Identity & Belonging** — "This is for people who are serious about X"

You ALWAYS use multiple triggers in combination — never just one.

### 4. OFFER WRITING FORMATS
You write for every platform and format:
- WhatsApp broadcasts and group messages
- Facebook posts and ads
- TikTok scripts (hook-problem-solution-CTA in 60 seconds)
- Email sequences (subject + body)
- Direct message scripts (cold and warm)
- Sales page copy (full long-form)
- VSL (Video Sales Letter) scripts
- Instagram captions

## WHAT YOU NEVER DO
- Never give generic advice that could apply to anyone
- Never use placeholder text like [insert here] or [your product]
- Never recommend leaving Z2B's ecosystem unless absolutely necessary
- Never be vague — always give specific, actionable outputs

## Z2B CONTEXT
The platform: Z2B Legacy Builders — "Transforming Employees to Entrepreneurs"
4M Machine: Manual → Automatic → Electric → Rocket Mode
9 Income Streams: NSB, ISP, QPB, TSC, TLI, CEO Competition, CEO Awards, Marketplace (90%), Distribution Rights
Target builder: Ambitious employees aged 28-45 in SA and Africa seeking entrepreneurial transformation
Faith-integrated: Kingdom business philosophy — integrity, prove-before-promote

When in doubt: ask one clarifying question, then produce outstanding work.`

// ══════════════════════════════════════════════════════════════════════════════
// SPECIALIZED PROMPT BUILDERS
// ══════════════════════════════════════════════════════════════════════════════

function buildOfferPrompt(params: {
  product: string
  audience: string
  price: string
  platform: string
  painPoints: string
  format: string
  triggers?: string[]
}): string {
  const allTriggers = [
    'FOMO', 'Social Proof', 'Authority', 'Scarcity/Urgency',
    'Reciprocity', 'Curiosity Gap', 'Pain Agitation',
    'Transformation Promise', 'Specificity', 'Relatability',
    'Risk Reversal', 'Anchoring', 'Identity/Belonging'
  ]
  const triggersToUse = params.triggers?.length ? params.triggers : allTriggers

  return `Write a world-class ${params.format} for ${params.platform} using these EXACT specifications:

PRODUCT: ${params.product}
AUDIENCE: ${params.audience}
PRICE: ${params.price}
PAIN POINTS: ${params.painPoints}
PLATFORM: ${params.platform}

MANDATORY PSYCHOLOGICAL TRIGGERS TO USE (all of them):
${triggersToUse.map((t,i) => `${i+1}. ${t}`).join('\n')}

PLATFORM RULES:
${params.platform === 'WhatsApp' ? '- Short paragraphs (max 3 lines each)\n- Conversational, no formal language\n- End with clear payment/contact instructions\n- Use emojis sparingly but powerfully' : ''}
${params.platform === 'Facebook' ? '- Hook in first line (no "Read More" click needed to be hooked)\n- Tell a story\n- End with clear CTA\n- Can be longer — FB rewards depth' : ''}
${params.platform === 'TikTok' ? '- 0-3s: Hook that stops the scroll\n- 3-15s: Agitate the problem\n- 15-45s: Introduce solution (tease, dont give everything)\n- 45-60s: CTA\n- Write as spoken word script with stage directions' : ''}
${params.platform === 'Email' ? '- Subject line that gets opened (curiosity + specificity)\n- Preview text\n- Story-driven body\n- PS line (most read part after subject)' : ''}
${params.platform === 'DM' ? '- Cold or warm opener that doesnt feel salesy\n- 3-message sequence (opener → value → ask)\n- Conversational, not a wall of text' : ''}
${params.platform === 'Sales Page' ? '- Full long-form copy\n- Headline + subheadline\n- Above fold, problem section, solution, benefits, social proof, offer, guarantee, CTA\n- Multiple CTAs throughout' : ''}

Write the COMPLETE, READY-TO-POST copy. Not a template — actual words. Use specific numbers, real-feeling testimonials, and local context (South African/African where relevant). Make it convert.`
}

function buildProductPrompt(params: {
  topic: string
  audience: string
  format: string
  market: string
  price: string
}): string {
  return `Create a COMPLETE, EXPERT-LEVEL digital product on this topic:

TOPIC: ${params.topic}
TARGET AUDIENCE: ${params.audience}
FORMAT: ${params.format}
MARKET: ${params.market}
RECOMMENDED PRICE: ${params.price}

Requirements:
- Write as a certified expert with deep knowledge of ${params.topic}
- Include ALL sections in full — never use placeholders
- Locally relevant content (currency, examples, context match ${params.market})
- Minimum 2000 words of actual content
- Actionable, specific, transformative

Structure your response EXACTLY like this:

## PRODUCT TITLE
[Compelling, specific title]

## SUBTITLE
[Promise-focused subtitle]

## WHO THIS IS FOR
[3-4 specific avatar descriptions]

## WHAT THEY WILL ACHIEVE
[Before → After transformation statement]

## TABLE OF CONTENTS
[Full chapter/section list]

## FULL CONTENT
[Complete product content — every section written in full, expert level]

## MARKETING HOOK
[One sentence that makes them buy immediately]

## RECOMMENDED PLATFORMS TO SELL
[Where to list this product]`
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ══════════════════════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action = 'chat', messages = [], userId, builderTier } = body

    // ── CHAT (General coaching) ───────────────────────────────────────────────
    if (action === 'chat') {
      const brain = selectBrain('chat')
      const allMessages = [
        { role: 'system', content: MANLAW_SYSTEM },
        ...messages.slice(-20), // last 20 messages for context
      ]
      const reply = await callBrain(brain, allMessages, 1500, 0.8)
      return NextResponse.json({ reply, brain })
    }

    // ── WRITE OFFER (All 13 triggers) ─────────────────────────────────────────
    if (action === 'write_offer') {
      const { product, audience, price, platform, painPoints, format, triggers } = body

      const prompt = buildOfferPrompt({ product, audience, price, platform, painPoints, format, triggers })
      const allMessages = [
        { role: 'system', content: MANLAW_SYSTEM },
        { role: 'user',   content: prompt },
      ]

      // GPT-4o for copywriting — best at conversion copy
      const copy = await callBrain('gpt4o', allMessages, 3000, 0.85)
      return NextResponse.json({ copy, triggers: triggers || 'all 13', platform })
    }

    // ── CREATE DIGITAL PRODUCT ────────────────────────────────────────────────
    if (action === 'create_product') {
      const { topic, audience, format, market, price } = body

      // Step 1: Create the product — use format-specific brain & settings
      const productConfig = PRODUCT_CONFIGS[format] || PRODUCT_CONFIGS['guide']
      const productPrompt = buildProductPrompt({ topic, audience, format, market, price, level: body.level })
      const productMessages = [
        { role: 'system', content: MANLAW_SYSTEM },
        { role: 'user',   content: productPrompt },
      ]
      // Software uses Claude Sonnet, all others use GPT-4o
      const productContent = await callBrain(productConfig.brain, productMessages, productConfig.maxTokens, productConfig.temperature)

      // Step 2: Auto-generate launch copy for WhatsApp + TikTok
      const launchPrompt = `You just created this digital product:\n\n${productContent.slice(0, 500)}\n\nNow write:\n1. A WhatsApp broadcast (using all 13 psychological triggers)\n2. A 60-second TikTok script\n3. 3 Facebook posts for days 1, 3 and 7 of launch week\n\nMake all copy ready to post immediately.`
      const launchMessages = [
        { role: 'system', content: MANLAW_SYSTEM },
        { role: 'user',   content: launchPrompt },
      ]
      const launchCopy = await callBrain('gpt4o', launchMessages, 2500, 0.85)

      return NextResponse.json({ productContent, launchCopy, topic, format, market })
    }

    // ── GENERATE OBJECTION HANDLERS ───────────────────────────────────────────
    if (action === 'objection_handlers') {
      const { product, price, audience } = body
      const prompt = `Write world-class objection handlers for:

Product: ${product}
Price: ${price}
Audience: ${audience}

For each objection below, write a response that uses psychological triggers (especially Risk Reversal, Transformation Promise, Social Proof and Specificity) to turn the objection into a reason to buy:

1. "It's too expensive / I don't have money"
2. "Let me think about it"
3. "I can find this free on Google"
4. "I'm not sure it will work for me"
5. "I don't trust buying things online"
6. "I need to ask my partner/spouse first"
7. "Send me more information"
8. "I'll buy next month"

Write FULL responses — not bullet points. These are real messages to copy-paste or speak.`

      const reply = await callBrain('gpt4o', [
        { role: 'system', content: MANLAW_SYSTEM },
        { role: 'user',   content: prompt },
      ], 2500, 0.8)

      return NextResponse.json({ handlers: reply })
    }

    // ── PAIN POINT RESEARCH ───────────────────────────────────────────────────
    if (action === 'research_pain_points') {
      const { market, category, demographic } = body
      const prompt = `You are a world-class market research analyst. Identify the top 10 most profitable pain points in:

Market: ${market}
Category: ${category}
Demographic: ${demographic}

For each pain point provide:
- Specific pain point title (be exact, not generic)
- Why they feel this pain deeply
- What they have already tried (and why it failed)
- What transformation they desperately want
- Recommended product format (ebook/guide/template/checklist/course/toolkit)
- Recommended price in local currency
- Estimated monthly demand
- Competition level (Low/Medium/High gap)

Be specific to the ${market} context. Use local examples.`

      const research = await callBrain('gpt4o', [
        { role: 'system', content: MANLAW_SYSTEM },
        { role: 'user',   content: prompt },
      ], 2500, 0.7)

      return NextResponse.json({ research, market, category })
    }

    // ── BUILD FULL SALES SYSTEM ───────────────────────────────────────────────
    if (action === 'build_sales_system') {
      const { product, audience, price, market } = body
      const prompt = `Build a complete 30-day sales system for:

Product: ${product}
Audience: ${audience}
Price: ${price}
Market: ${market}

Deliver a complete system including:

## WEEK 1: AWARENESS
- 3 Facebook posts (ready to post)
- 3 WhatsApp status ideas
- 1 TikTok video script
- Target groups/communities to post in

## WEEK 2: EDUCATION
- 3 value posts that build authority
- 1 email to your list (if applicable)
- 1 live video script outline

## WEEK 3: SOCIAL PROOF
- How to collect and share testimonials
- 3 social proof posts
- 1 case study template

## WEEK 4: CLOSE
- Final push WhatsApp broadcast
- Urgency/scarcity strategy
- Follow-up sequence (5 messages)

## DAILY INCOME TARGETS
- Conservative (10 sales/month): R___
- Realistic (25 sales/month): R___  
- Stretch (50 sales/month): R___

Use all 13 psychological triggers throughout. Make every piece copy-paste ready.`

      const system = await callBrain('gpt4o', [
        { role: 'system', content: MANLAW_SYSTEM },
        { role: 'user',   content: prompt },
      ], 4000, 0.8)

      return NextResponse.json({ system, product })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  } catch (e: any) {
    console.error('[CoachManlaw] ERROR:', e.message)

    // Fallback to gpt-4o-mini if primary fails
    if (body?.action === 'chat' && body?.messages) {
      try {
        const key = process.env.OPENAI_API_KEY || ''
        if (key) {
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              max_tokens: 1000,
              messages: [{ role:'system', content: MANLAW_SYSTEM }, ...body.messages.slice(-10)],
            }),
          })
          const data = await res.json()
          return NextResponse.json({ reply: data.choices?.[0]?.message?.content || 'Coach Manlaw is thinking...', brain:'fallback' })
        }
      } catch (fallbackErr) {}
    }

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
