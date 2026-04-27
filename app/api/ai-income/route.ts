import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY || ''
    if (!apiKey || apiKey.length < 20) {
      return NextResponse.json({ error: 'AI not configured.' }, { status: 500 })
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.error?.message || 'OpenAI error' }, { status: 500 })

    const text = data.choices?.[0]?.message?.content?.trim() || ''
    return NextResponse.json({ content: [{ text }] })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
