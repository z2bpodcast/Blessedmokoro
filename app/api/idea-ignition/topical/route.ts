// File: app/api/idea-ignition/topical/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'

async function getUser(req: NextRequest) {
  const sb    = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return { user: null }
  const { data: { user } } = await sb.auth.getUser(token)
  return { user }
}

export async function POST(req: NextRequest) {
  const { user } = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { topic } = await req.json()
  if (!topic?.trim()) return NextResponse.json({ error: 'Topic is required' }, { status: 400 })

  const prompt = `You are a digital product strategist specialising in the South African market.

A builder wants to create digital products around this topic or theme: "${topic}"

Generate 6 highly specific digital product ideas tailored to this topic.
Each idea must solve a real problem for a real audience.

Respond ONLY with valid JSON — no markdown, no preamble:
{
  "topic": "${topic}",
  "opportunities": [
    {
      "id": "t1",
      "title": "Specific product title",
      "category": "Category",
      "audience": "Specific target audience",
      "problemSolved": "Exact problem this solves",
      "format": "ebook|course|template|toolkit|checklist|workbook",
      "priceRangeMin": 99,
      "priceRangeMax": 499,
      "difficulty": "beginner|intermediate|advanced",
      "whyNow": "Why this is relevant right now"
    }
  ]
}`

  try {
    const res  = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
      body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 2000, temperature: 0.8,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    })
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(text)
    return NextResponse.json({ opportunities: parsed.opportunities ?? [], topic })
  } catch (e) {
    return NextResponse.json({ error: 'Could not generate ideas. Please try again.' }, { status: 500 })
  }
}
