// FILE: app/api/coach-manlaw/route.ts
import { NextRequest, NextResponse } from 'next/server'

function openAIModel(tier: string) {
  const t = (tier || '').toLowerCase()
  if (t === 'gold' || t === 'platinum') return { model: 'gpt-4o', maxTokens: 2000 }
  if (t === 'silver') return { model: 'gpt-4o-mini', maxTokens: 1500 }
  return { model: 'gpt-4o-mini', maxTokens: 1000 }
}

function claudeModel(tier: string) {
  const t = (tier || '').toLowerCase()
  if (t === 'gold' || t === 'platinum') return { model: 'claude-sonnet-4-5', maxTokens: 2000 }
  return { model: 'claude-haiku-4-5-20251001', maxTokens: 1000 }
}

async function callOpenAI(messages: any[], system: string, tier: string, apiKey: string): Promise<string> {
  const { model, maxTokens } = openAIModel(tier)
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model, max_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, ...messages.slice(-10)],
    }),
  })
  const raw = await res.text()
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${raw.slice(0, 300)}`)
  const reply = JSON.parse(raw).choices?.[0]?.message?.content?.trim()
  if (!reply) throw new Error('OpenAI empty response')
  return reply
}

async function callClaude(messages: any[], system: string, tier: string, apiKey: string): Promise<string> {
  const { model, maxTokens } = claudeModel(tier)
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: messages.slice(-10) }),
  })
  const raw = await res.text()
  if (!res.ok) throw new Error(`Claude ${res.status}: ${raw.slice(0, 300)}`)
  const reply = JSON.parse(raw).content?.[0]?.text?.trim()
  if (!reply) throw new Error('Claude empty response')
  return reply
}

async function getKeyFromSupabase(keyName: string): Promise<string> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) return ''
    const res = await fetch(
      `${url}/rest/v1/z2b_api_keys?key_name=eq.${keyName}&select=key_value&limit=1`,
      { headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` } }
    )
    if (!res.ok) return ''
    const rows = await res.json()
    return rows?.[0]?.key_value?.trim() || ''
  } catch { return '' }
}

const COACH_SYSTEM = `You are Coach Manlaw — The Executor. You power the 4M Mobile Money Making Machine for South African entrepreneurs.

ABSOLUTE RULES:
1. NEVER say "I am here with you" or any passive greeting.
2. NEVER give motivation without specific action steps.
3. ALWAYS give 3-5 numbered, specific action steps.
4. ALWAYS end with "YOUR NEXT ACTION: [one thing to do in the next 2 hours]"
5. Use ZAR for all prices. South African context only.
6. Be direct. Be specific. Maximum 250 words.

Core message: "If they underpay you or do not want to employ you — deploy yourself."

WHEN SOMEONE GREETS YOU: Skip pleasantries. Ask: "What is your skill and what do you want to earn?" then give a 3-step income plan.`

export async function GET() {
  // Diagnostic endpoint — visit /api/coach-manlaw to check keys
  const oaiEnv = (process.env.OPENAI_API_KEY || '').trim()
  const antEnv = (process.env.ANTHROPIC_API_KEY || '').trim()
  const oaiDB  = await getKeyFromSupabase('OPENAI_API_KEY')
  const antDB  = await getKeyFromSupabase('ANTHROPIC_API_KEY')
  return NextResponse.json({
    openai_env_chars:    oaiEnv.length,
    openai_env_prefix:   oaiEnv.slice(0, 7),
    anthropic_env_chars: antEnv.length,
    openai_db_chars:     oaiDB.length,
    openai_db_prefix:    oaiDB.slice(0, 7),
    engine: oaiEnv.length > 20 || oaiDB.length > 20 ? 'openai'
           : antEnv.length > 20 || antDB.length > 20 ? 'anthropic'
           : 'none',
  })
}

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, tier } = await req.json()
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    // Get keys — env first, then Supabase
    const oaiEnv = (process.env.OPENAI_API_KEY || '').trim()
    const antEnv = (process.env.ANTHROPIC_API_KEY || '').trim()
    const oaiKey = oaiEnv.length > 20 ? oaiEnv : await getKeyFromSupabase('OPENAI_API_KEY')
    const antKey = antEnv.length > 20 ? antEnv : await getKeyFromSupabase('ANTHROPIC_API_KEY')

    const engine = oaiKey.length > 20 ? 'openai' : antKey.length > 20 ? 'anthropic' : 'none'

    console.log(`[Manlaw] oai_env=${oaiEnv.length} oai_db=${oaiKey.length} ant_env=${antEnv.length} engine=${engine}`)

    if (engine === 'none') {
      return NextResponse.json({
        reply: 'Coach Manlaw needs an API key. Go to Admin → API Settings → paste your OpenAI key → Save.',
      })
    }

    const system = (systemPrompt && systemPrompt.trim().length > 100)
      ? systemPrompt.trim() : COACH_SYSTEM

    let reply: string
    if (engine === 'openai') {
      try {
        reply = await callOpenAI(messages, system, tier || 'starter', oaiKey)
      } catch (err: any) {
        console.error(`[Manlaw] OpenAI failed: ${err.message}`)
        if (antKey.length > 20) {
          reply = await callClaude(messages, system, tier || 'starter', antKey)
        } else throw err
      }
    } else {
      reply = await callClaude(messages, system, tier || 'starter', antKey)
    }

    console.log(`[Manlaw] ✅ ${engine}: ${reply.slice(0, 80)}`)
    return NextResponse.json({ reply })

  } catch (e: any) {
    console.error(`[Manlaw] ERROR: ${e.message}`)
    return NextResponse.json({ reply: `Error: ${e.message}` })
  }
}
