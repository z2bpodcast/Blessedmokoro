// FILE: app/api/coach-manlaw/route.ts
import { NextRequest, NextResponse } from 'next/server'

function openAIModel(tier: string) {
  const t = (tier || '').toLowerCase()
  if (t === 'gold' || t === 'platinum') return { model: 'gpt-3.5-turbo', maxTokens: 1000 }
  if (t === 'silver') return { model: 'gpt-3.5-turbo', maxTokens: 1000 }
  return { model: 'gpt-3.5-turbo', maxTokens: 1000 }
}

const COACH_SYSTEM = `You are Coach Manlaw, a direct South African business execution coach. You ONLY respond with numbered action steps. You NEVER greet. You NEVER say "I am here". You NEVER give motivation without steps.

FORMAT EVERY RESPONSE EXACTLY LIKE THIS:
Here is your plan:
1. [specific action]
2. [specific action]  
3. [specific action]

YOUR NEXT ACTION: [one thing to do in the next 2 hours]

Use ZAR. Be specific. Under 200 words. Start immediately with "Here is your plan:" — no greeting, no introduction.`

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
