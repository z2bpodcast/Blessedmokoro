// FILE: app/api/coach-manlaw/route.ts
// Coach Manlaw AI — OpenAI primary, Claude fallback
// Keys read at request time so env var changes take effect after redeploy

import { NextRequest, NextResponse } from 'next/server'

function getKeys() {
  return {
    openai:    (process.env.OPENAI_API_KEY    || '').trim(),
    anthropic: (process.env.ANTHROPIC_API_KEY || '').trim(),
  }
}

function getEngine(): 'openai' | 'anthropic' | 'none' {
  const { openai, anthropic } = getKeys()
  if (openai    && openai.length    > 20) return 'openai'
  if (anthropic && anthropic.length > 20) return 'anthropic'
  return 'none'
}

function openAIModel(tier: string) {
  const t = (tier || '').toLowerCase()
  if (t === 'gold' || t === 'platinum') return { model: 'gpt-4o',      maxTokens: 2000 }
  if (t === 'silver')                   return { model: 'gpt-4o-mini', maxTokens: 1500 }
  return                                       { model: 'gpt-4o-mini', maxTokens: 1000 }
}

function claudeModel(tier: string) {
  const t = (tier || '').toLowerCase()
  if (t === 'gold' || t === 'platinum') return { model: 'claude-sonnet-4-5',        maxTokens: 2000 }
  return                                       { model: 'claude-haiku-4-5-20251001', maxTokens: 1000 }
}

async function callOpenAI(messages: any[], system: string, tier: string): Promise<string> {
  const { openai } = getKeys()
  const { model, maxTokens } = openAIModel(tier)
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openai}` },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, ...messages.slice(-10)],
    }),
  })
  const raw = await res.text()
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${raw.slice(0,200)}`)
  const data = JSON.parse(raw)
  const reply = data.choices?.[0]?.message?.content?.trim()
  if (!reply) throw new Error('OpenAI empty response')
  return reply
}

async function callClaude(messages: any[], system: string, tier: string): Promise<string> {
  const { anthropic } = getKeys()
  const { model, maxTokens } = claudeModel(tier)
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         anthropic,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: messages.slice(-10),
    }),
  })
  const raw = await res.text()
  if (!res.ok) throw new Error(`Claude ${res.status}: ${raw.slice(0,200)}`)
  const data = JSON.parse(raw)
  const reply = data.content?.[0]?.text?.trim()
  if (!reply) throw new Error('Claude empty response')
  return reply
}

// ── The ONE true Coach Manlaw system prompt ───────────────────────────────────
const COACH_SYSTEM_DEFAULT = `You are Coach Manlaw — The Executor. The intelligence engine behind the 4M: Mobile Money Making Machine.

Core message: "If they underpay you or do not want to employ you — deploy yourself."

IDENTITY RULES
- NEVER mention APIs, models, tokens, or technical infrastructure.
- NEVER give vague motivational talk without concrete execution steps.
- ALWAYS speak in business terms: execution, systems, income, scaling.
- ALWAYS focus on action over explanation.
- South African context — use ZAR, understand the SA market.

EXECUTION APPROACH
- For "create/start/give me": 3-5 steps max. Very simple. Focus: Do this NOW.
- For "plan/strategy/how should I": 2-3 options max. Clear recommendation.
- For scaling/complex: Analyse trade-offs. ONE best path. Convert to steps.

DIGITAL PRODUCT ENGINE
From ONE idea generate: eBook, Mini-course, Audio training, Templates, Membership, Coaching, Done-for-you service.
Always: 1) Expand idea 2) Show variations 3) Recommend ONE best 4) Give execution steps.

INCOME PATHWAY (give NEXT step only)
1. Zero to First Income → 2. First Consistency → 3. R10,000/month → 4. System Building → 5. Multiple Streams

RESPONSE RULES
- End EVERY response with: "YOUR NEXT ACTION: [one specific thing to do in the next 2 hours]"
- Keep responses under 250 words.
- Use ZAR for all prices.
- Be direct. Be specific. No fluff.`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, systemPrompt, tier } = body

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 })
    }

    const engine = getEngine()
    const { openai, anthropic } = getKeys()

    // Debug log — visible in Vercel function logs
    console.log(`[Coach Manlaw] engine=${engine} | openai=${openai.length}chars | anthropic=${anthropic.length}chars | tier=${tier}`)

    if (engine === 'none') {
      return NextResponse.json({
        reply: 'Coach Manlaw needs an API key to activate. Go to Admin → API Settings and add your OpenAI or Anthropic key, then redeploy.',
      })
    }

    // Use the full COACH_SYSTEM from frontend if provided, else use the built-in default
    const system = (systemPrompt && systemPrompt.trim().length > 100)
      ? systemPrompt.trim()
      : COACH_SYSTEM_DEFAULT

    let reply: string

    if (engine === 'openai') {
      try {
        reply = await callOpenAI(messages, system, tier || 'starter')
        console.log(`[Coach Manlaw] ✅ OpenAI replied: ${reply.slice(0, 60)}`)
      } catch (err: any) {
        console.error(`[Coach Manlaw] OpenAI failed: ${err.message}`)
        if (anthropic.length > 20) {
          reply = await callClaude(messages, system, tier || 'starter')
          console.log(`[Coach Manlaw] ✅ Claude fallback replied: ${reply.slice(0, 60)}`)
        } else {
          throw err
        }
      }
    } else {
      reply = await callClaude(messages, system, tier || 'starter')
      console.log(`[Coach Manlaw] ✅ Claude replied: ${reply.slice(0, 60)}`)
    }

    return NextResponse.json({ reply })

  } catch (e: any) {
    console.error(`[Coach Manlaw] ERROR: ${e.message}`)
    return NextResponse.json({
      reply: `Coach Manlaw encountered an error: ${e.message}`,
    })
  }
}
