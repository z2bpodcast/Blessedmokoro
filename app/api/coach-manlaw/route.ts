// FILE: app/api/coach-manlaw/route.ts
import { NextRequest, NextResponse } from 'next/server'

function openAIModel(tier: string) {
  const t = (tier || '').toLowerCase()
  if (t === 'gold' || t === 'platinum') return { model: 'gpt-4o', maxTokens: 2000 }
  if (t === 'silver') return { model: 'gpt-4o-mini', maxTokens: 1500 }
  return { model: 'gpt-4o-mini', maxTokens: 1000 }
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
  const key = process.env.OPENAI_API_KEY || ''
  return NextResponse.json({
    has_key: key.length > 0,
    key_length: key.length,
    key_prefix: key.slice(0, 7),
    key_suffix: key.slice(-4),
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, systemPrompt, tier } = body

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    const apiKey = (process.env.OPENAI_API_KEY || '').trim()

    console.log(`[Manlaw] key_length=${apiKey.length} key_prefix=${apiKey.slice(0,7)} tier=${tier}`)

    // Return debug info if requested
    if (body?.debug) {
      return NextResponse.json({
        debug: true,
        openai_key_length: apiKey.length,
        openai_key_prefix: apiKey.slice(0, 7),
        openai_key_suffix: apiKey.slice(-4),
        has_key: apiKey.length > 20,
        env_keys: Object.keys(process.env).filter(k => k.includes('API') || k.includes('KEY')),
      })
    }

    if (!apiKey || apiKey.length < 20) {
      return NextResponse.json({
        reply: `No OpenAI key found. Key length: ${apiKey.length}. Please add OPENAI_API_KEY to Vercel environment variables.`,
      })
    }

    const { model, maxTokens } = openAIModel(tier || 'starter')
    // Always use the backend system prompt — ignore frontend override
    const system = COACH_SYSTEM

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: 'system', content: system }, ...messages.slice(-10)],
      }),
    })

    const raw = await res.text()
    console.log(`[Manlaw] OpenAI status=${res.status}`)

    if (!res.ok) {
      return NextResponse.json({ reply: `OpenAI error ${res.status}: ${raw.slice(0, 200)}` })
    }

    const reply = JSON.parse(raw).choices?.[0]?.message?.content?.trim()
    console.log(`[Manlaw] ✅ reply: ${reply?.slice(0, 80)}`)
    return NextResponse.json({ reply: reply || 'No response from AI' })

  } catch (e: any) {
    console.error(`[Manlaw] ERROR: ${e.message}`)
    return NextResponse.json({ reply: `Error: ${e.message}` })
  }
}
