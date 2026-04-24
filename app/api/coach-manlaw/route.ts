// FILE: app/api/coach-manlaw/route.ts
// Coach Manlaw AI — OpenAI (primary) + Claude (fallback)
// Keys read at request time — not module load time — so new env vars work immediately after redeploy

import { NextRequest, NextResponse } from 'next/server'

// ── Read keys at request time ─────────────────────────────────────────────────
function getKeys() {
  return {
    openai:    process.env.OPENAI_API_KEY    || '',
    anthropic: process.env.ANTHROPIC_API_KEY || '',
  }
}

function getEngine(): 'openai' | 'anthropic' | 'none' {
  const { openai, anthropic } = getKeys()
  if (openai    && openai.length    > 20) return 'openai'
  if (anthropic && anthropic.length > 20) return 'anthropic'
  return 'none'
}

// ── Model selection per tier ──────────────────────────────────────────────────
function openAIModel(tier: string): { model: string; maxTokens: number } {
  const t = (tier || 'starter').toLowerCase()
  if (t === 'gold' || t === 'platinum') return { model: 'gpt-4o',      maxTokens: 2000 }
  if (t === 'silver')                   return { model: 'gpt-4o-mini', maxTokens: 1500 }
  return                                       { model: 'gpt-4o-mini', maxTokens: 1000 }
}

function claudeModel(tier: string): { model: string; maxTokens: number } {
  const t = (tier || 'starter').toLowerCase()
  if (t === 'gold' || t === 'platinum') return { model: 'claude-sonnet-4-5',         maxTokens: 2000 }
  return                                       { model: 'claude-haiku-4-5-20251001',  maxTokens: 1000 }
}

// ── OpenAI call ───────────────────────────────────────────────────────────────
async function callOpenAI(messages: any[], system: string, tier: string): Promise<string> {
  const { openai }             = getKeys()
  const { model, maxTokens }   = openAIModel(tier)

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${openai}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        ...messages.slice(-10),
      ],
    }),
  })

  const raw = await res.text()
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${raw}`)

  const data = JSON.parse(raw)
  const reply = data.choices?.[0]?.message?.content?.trim()
  if (!reply) throw new Error('OpenAI returned empty response')
  return reply
}

// ── Claude call ───────────────────────────────────────────────────────────────
async function callClaude(messages: any[], system: string, tier: string): Promise<string> {
  const { anthropic }          = getKeys()
  const { model, maxTokens }   = claudeModel(tier)

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method:  'POST',
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
  if (!res.ok) throw new Error(`Claude ${res.status}: ${raw}`)

  const data = JSON.parse(raw)
  const reply = data.content?.[0]?.text?.trim()
  if (!reply) throw new Error('Claude returned empty response')
  return reply
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, systemPrompt, tier } = body

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 })
    }

    const engine = getEngine()
    const { openai, anthropic } = getKeys()

    // Log for Vercel debugging
    console.log(`Coach Manlaw: engine=${engine} openai_key_len=${openai.length} anthropic_key_len=${anthropic.length} tier=${tier}`)

    if (engine === 'none') {
      return NextResponse.json({
        reply: 'Coach Manlaw is offline — API key not configured. Go to Admin → API Settings and add your OpenAI key, then redeploy.',
      })
    }

    // Use the passed system prompt (full COACH_SYSTEM from frontend)
    // Fall back to a tight default if nothing passed
    const system = systemPrompt?.trim() || `You are Coach Manlaw — The Executor. A direct, action-driven business coach for South African entrepreneurs. Never give vague motivation. Always give 3-5 specific action steps. End every response with ONE thing the user must do RIGHT NOW. South African context. Keep responses under 200 words.`

    let reply: string

    if (engine === 'openai') {
      try {
        reply = await callOpenAI(messages, system, tier || 'starter')
        console.log(`✅ OpenAI (${openAIModel(tier||'starter').model}): ${reply.slice(0, 80)}`)
      } catch (err: any) {
        console.error(`OpenAI failed: ${err.message}`)
        if (anthropic && anthropic.length > 20) {
          console.log('Falling back to Claude...')
          reply = await callClaude(messages, system, tier || 'starter')
          console.log(`✅ Claude fallback: ${reply.slice(0, 80)}`)
        } else {
          throw err
        }
      }
    } else {
      reply = await callClaude(messages, system, tier || 'starter')
      console.log(`✅ Claude: ${reply.slice(0, 80)}`)
    }

    return NextResponse.json({ reply })

  } catch (e: any) {
    console.error('Coach Manlaw error:', e.message)
    return NextResponse.json({
      reply: `Coach Manlaw hit an error: ${e.message}. Check Vercel logs for details.`,
    })
  }
}
