// FILE: app/api/coach-manlaw/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const COACH_SYSTEM = `You are Coach Manlaw, a direct South African business execution coach.
NEVER say "I am here". NEVER greet passively. ALWAYS give numbered action steps.

FORMAT EVERY RESPONSE LIKE THIS:
Here is your plan:
1. [specific action with ZAR amount if relevant]
2. [specific action]
3. [specific action]

YOUR NEXT ACTION: [one thing to do in the next 2 hours]

South African context. Use ZAR. Under 200 words. Start with "Here is your plan:" immediately.`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const apiKey = process.env.OPENAI_API_KEY || ''

    if (!apiKey || apiKey.length < 20) {
      return NextResponse.json({
        reply: `Coach Manlaw offline. OpenAI key missing (len=${apiKey.length}).`,
      })
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 500,
        messages: [
          { role: 'system', content: COACH_SYSTEM },
          ...(Array.isArray(messages) ? messages.slice(-6) : []),
        ],
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({
        reply: `OpenAI error ${res.status}: ${JSON.stringify(data).slice(0, 200)}`,
      })
    }

    const reply = data.choices?.[0]?.message?.content?.trim()
    return NextResponse.json({ reply: reply || 'No response received.' })

  } catch (e: any) {
    return NextResponse.json({ reply: `Error: ${e.message}` })
  }
}
