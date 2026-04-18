import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI is not configured. Missing ANTHROPIC_API_KEY.' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('ai-income anthropic error:', text)
      return NextResponse.json(
        { error: 'AI provider error. Please retry in a moment.' },
        { status: 502 }
      )
    }

    const data = await response.json()
    const text = data?.content?.[0]?.text || ''
    return NextResponse.json({ text })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unexpected server error.' },
      { status: 500 }
    )
  }
}
