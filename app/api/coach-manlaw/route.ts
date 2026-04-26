// FILE: app/api/coach-manlaw/route.ts
import { NextRequest, NextResponse } from 'next/server'

const COACH_SYSTEM = `You are Coach Manlaw, a direct South African business execution coach. You ONLY respond with numbered action steps. You NEVER greet. You NEVER say "I am here". You NEVER give motivation without steps.

FORMAT EVERY RESPONSE EXACTLY LIKE THIS:
Here is your plan:
1. [specific action]
2. [specific action]
3. [specific action]

YOUR NEXT ACTION: [one thing to do in the next 2 hours]

Use ZAR. Be specific. Under 200 words. Start immediately with "Here is your plan:" no greeting no introduction.`

async function getOpenAIKey(): Promise<string> {
  // Try Supabase first (saved via Admin panel)
  try {
    const url  = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const skey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    if (url && skey) {
      const r = await fetch(
        `${url}/rest/v1/z2b_api_keys?key_name=eq.OPENAI_API_KEY&select=key_value`,
        { headers: { apikey: skey, Authorization: `Bearer ${skey}` }, cache: 'no-store' }
      )
      const rows = await r.json()
      const val = rows?.[0]?.key_value?.trim()
      if (val && val.length > 20) {
        console.log(`[Manlaw] key from Supabase len=${val.length}`)
        return val
      }
    }
  } catch (e: any) {
    console.log(`[Manlaw] Supabase key fetch failed: ${e.message}`)
  }

  // Fall back to env var
  const envKey = (process.env.OPENAI_API_KEY || '').trim()
  console.log(`[Manlaw] key from env len=${envKey.length}`)
  return envKey
}

export async function POST(req: NextRequest) {
  try {
    const { messages, tier } = await req.json()

    const apiKey = await getOpenAIKey()
    console.log(`[Manlaw] final key len=${apiKey.length} prefix=${apiKey.slice(0,7)}`)

    if (!apiKey || apiKey.length < 20) {
      return NextResponse.json({
        reply: `Coach Manlaw offline — no API key found (len=${apiKey.length}). Paste your OpenAI key in Admin → API Settings.`,
      })
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:      'gpt-3.5-turbo',
        max_tokens: 500,
        messages: [
          { role: 'system', content: COACH_SYSTEM },
          ...( Array.isArray(messages) ? messages.slice(-6) : [] ),
        ],
      }),
    })

    const raw = await res.text()
    console.log(`[Manlaw] OpenAI status=${res.status} body=${raw.slice(0,120)}`)

    if (!res.ok) {
      return NextResponse.json({ reply: `OpenAI error ${res.status}: ${raw.slice(0,200)}` })
    }

    const reply = JSON.parse(raw).choices?.[0]?.message?.content?.trim()
    return NextResponse.json({ reply: reply || 'No response' })

  } catch (e: any) {
    console.error(`[Manlaw] ERROR: ${e.message}`)
    return NextResponse.json({ reply: `Error: ${e.message}` })
  }
}

// Sun, Apr 26, 2026  9:15:26 PM
