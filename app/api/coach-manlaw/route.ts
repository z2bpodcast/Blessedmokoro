// FILE: app/api/coach-manlaw/route.ts
// Coach Manlaw — OpenAI primary, Claude fallback
// Reads keys from: 1) Supabase z2b_api_keys table  2) Vercel env vars

import { NextRequest, NextResponse } from 'next/server'

async function getKeyFromSupabase(keyName: string): Promise<string> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return ''

    const res = await fetch(
      `${url}/rest/v1/z2b_api_keys?key_name=eq.${keyName}&select=key_value&limit=1`,
      { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
    )
    if (!res.ok) return ''
    const rows = await res.json()
    return rows?.[0]?.key_value?.trim() || ''
  } catch {
    return ''
  }
}

async function getKey(keyName: string): Promise<string> {
  // 1. Vercel env var (fastest, most reliable)
  const fromEnv = (process.env[keyName] || '').trim()
  if (fromEnv.length > 20) return fromEnv

  // 2. Supabase (Admin panel saved key)
  const fromDB = await getKeyFromSupabase(keyName)
  if (fromDB.length > 20) return fromDB

  return ''
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
  const apiKey = await getKey('OPENAI_API_KEY')
  const { model, maxTokens } = openAIModel(tier)

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, ...messages.slice(-10)],
    }),
  })

  const raw = await res.text()
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${raw.slice(0, 300)}`)
  const reply = JSON.parse(raw).choices?.[0]?.message?.content?.trim()
  if (!reply) throw new Error('OpenAI empty response')
  return reply
}

async function callClaude(messages: any[], system: string, tier: string): Promise<string> {
  const apiKey = await getKey('ANTHROPIC_API_KEY')
  const { model, maxTokens } = claudeModel(tier)

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method:  'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: messages.slice(-10) }),
  })

  const raw = await res.text()
  if (!res.ok) throw new Error(`Claude ${res.status}: ${raw.slice(0, 300)}`)
  const reply = JSON.parse(raw).content?.[0]?.text?.trim()
  if (!reply) throw new Error('Claude empty response')
  return reply
}

const COACH_SYSTEM_DEFAULT = `You are Coach Manlaw — The Executor. You power the 4M Mobile Money Making Machine for South African entrepreneurs.

ABSOLUTE RULES — NEVER BREAK THESE:
1. NEVER say "I am here with you" or any passive greeting.
2. NEVER give motivation without specific action steps.
3. ALWAYS give 3-5 numbered, specific action steps.
4. ALWAYS end with "YOUR NEXT ACTION: [one thing to do in the next 2 hours]"
5. Use ZAR for all prices. South African context only.
6. Be direct. Be specific. Maximum 250 words.

Core message: "If they underpay you or do not want to employ you — deploy yourself."

WHEN SOMEONE GREETS YOU: Skip pleasantries. Ask immediately: "What is your skill and what do you want to earn?" then give a 3-step income plan.

EXECUTION MODES:
- "create/start/give me" → 3-5 steps, very simple, focus on doing it NOW
- "plan/strategy/how" → 2-3 options, clear recommendation, convert to steps
- "scale/grow/system" → analyse trade-offs, ONE best path, execution steps`

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, tier } = await req.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    const openaiKey    = await getKey('OPENAI_API_KEY')
    const anthropicKey = await getKey('ANTHROPIC_API_KEY')
    const engine       = openaiKey.length > 20 ? 'openai'
                       : anthropicKey.length > 20 ? 'anthropic'
                       : 'none'

    console.log(`[Manlaw] engine=${engine} oai=${openaiKey.length} ant=${anthropicKey.length} tier=${tier}`)

    if (engine === 'none') {
      return NextResponse.json({
        reply: 'Coach Manlaw needs an API key. Go to Admin → API Settings → paste your OpenAI key → Save.',
      })
    }

    const system = (systemPrompt && systemPrompt.trim().length > 100)
      ? systemPrompt.trim()
      : COACH_SYSTEM_DEFAULT

    let reply: string

    if (engine === 'openai') {
      try {
        reply = await callOpenAI(messages, system, tier || 'starter')
        console.log(`[Manlaw] ✅ OpenAI: ${reply.slice(0, 80)}`)
      } catch (err: any) {
        console.error(`[Manlaw] OpenAI error: ${err.message}`)
        if (anthropicKey.length > 20) {
          reply = await callClaude(messages, system, tier || 'starter')
          console.log(`[Manlaw] ✅ Claude fallback: ${reply.slice(0, 80)}`)
        } else {
          throw err
        }
      }
    } else {
      reply = await callClaude(messages, system, tier || 'starter')
      console.log(`[Manlaw] ✅ Claude: ${reply.slice(0, 80)}`)
    }

    return NextResponse.json({ reply })

  } catch (e: any) {
    console.error(`[Manlaw] ERROR: ${e.message}`)
    return NextResponse.json({ reply: `Error: ${e.message}` })
  }
}
