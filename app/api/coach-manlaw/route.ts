import { NextRequest, NextResponse } from 'next/server'

// FILE: app/api/coach-manlaw/route.ts
// Coach Manlaw AI — powered by Claude Sonnet

export async function POST(req: NextRequest) {
  try {
    const { systemPrompt, messages } = await req.json()
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system:     systemPrompt || 'You are Coach Manlaw, an AI Execution Coach for Z2B Table Banquet. Be direct, action-driven and encouraging. Keep responses under 180 words.',
        messages:   messages.slice(-10), // Last 10 messages for context
      })
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic error:', err)
      return NextResponse.json({ error: 'Coach Manlaw unavailable' }, { status: 502 })
    }

    const data  = await response.json()
    const reply = data.content?.[0]?.text || 'I am here. Ask me anything.'

    return NextResponse.json({ reply })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
