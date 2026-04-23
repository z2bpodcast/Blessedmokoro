// FILE: app/api/coach-manlaw/route.ts
// Coach Manlaw AI — Dual-engine: OpenAI (primary) + Claude (fallback)
// Frontend never knows which engine is running — backend decision only

import { NextRequest, NextResponse } from 'next/server'

const OPENAI_API_KEY    = process.env.OPENAI_API_KEY    || ''
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

// ── Determine which engine to use ────────────────────────────────────────────
// OpenAI is primary when key is present. Claude is fallback.
function getEngine(): 'openai' | 'anthropic' | 'none' {
  if (OPENAI_API_KEY && OPENAI_API_KEY.length > 20) return 'openai'
  if (ANTHROPIC_API_KEY && ANTHROPIC_API_KEY.length > 20) return 'anthropic'
  return 'none'
}

// ── Map tier to OpenAI model ──────────────────────────────────────────────────
// Backend-only: determines capability per tier using token allocation rules
function getTierModel(tier: string): { model: string; maxTokens: number } {
  const t = (tier || 'starter').toLowerCase()
  // Gold and Platinum → GPT-4.1 (most capable, fair use daily)
  if (t === 'gold' || t === 'platinum') {
    return { model: 'gpt-4.1', maxTokens: 2000 }
  }
  // Silver → GPT-4.1 mini (strong, monthly allocation)
  if (t === 'silver') {
    return { model: 'gpt-4.1-mini', maxTokens: 1500 }
  }
  // Starter, Bronze, Copper → GPT-4.1 nano (efficient, monthly allocation)
  return { model: 'gpt-4.1-nano', maxTokens: 1000 }
}

// ── Map tier to Claude model (fallback) ──────────────────────────────────────
function getTierClaudeModel(tier: string): { model: string; maxTokens: number } {
  const t = (tier || 'starter').toLowerCase()
  if (t === 'gold' || t === 'platinum') {
    return { model: 'claude-sonnet-4-5', maxTokens: 2000 }
  }
  return { model: 'claude-haiku-4-5-20251001', maxTokens: 1000 }
}

// ── OpenAI call ───────────────────────────────────────────────────────────────
async function callOpenAI(
  messages: any[],
  systemPrompt: string,
  tier: string
): Promise<string> {
  const { model, maxTokens } = getTierModel(tier)

  const payload = {
    model,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10),
    ],
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || 'Ready. What would you like to build today?'
}

// ── Anthropic call (fallback) ─────────────────────────────────────────────────
async function callAnthropic(
  messages: any[],
  systemPrompt: string,
  tier: string
): Promise<string> {
  const { model, maxTokens } = getTierClaudeModel(tier)

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method:  'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system:     systemPrompt,
      messages:   messages.slice(-10),
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text || 'Ready. What would you like to execute today?'
}

// ── Main POST handler ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, tier } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    const engine = getEngine()

    if (engine === 'none') {
      return NextResponse.json(
        { error: 'Coach Manlaw is not configured. Add API keys in Admin → API Settings.' },
        { status: 503 }
      )
    }

    const coachSystem = systemPrompt ||
      'You are Coach Manlaw — The Executor. Be direct, action-driven and South African context-aware. Always end with ONE specific next action. Keep responses under 200 words.'

    let reply: string

    if (engine === 'openai') {
      try {
        reply = await callOpenAI(messages, coachSystem, tier || 'starter')
      } catch (openaiErr) {
        console.error('OpenAI failed, falling back to Claude:', openaiErr)
        // Fallback to Claude if OpenAI fails
        if (ANTHROPIC_API_KEY && ANTHROPIC_API_KEY.length > 20) {
          reply = await callAnthropic(messages, coachSystem, tier || 'starter')
        } else {
          throw openaiErr
        }
      }
    } else {
      reply = await callAnthropic(messages, coachSystem, tier || 'starter')
    }

    return NextResponse.json({ reply, engine }) // engine returned for admin debug only

  } catch (e: any) {
    console.error('Coach Manlaw error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
