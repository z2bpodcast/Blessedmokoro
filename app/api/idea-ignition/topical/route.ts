// File: app/api/idea-ignition/topical/route.ts — GLOBAL VERSION
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

  const { topic, market } = await req.json()
  if (!topic?.trim()) return NextResponse.json({ error: 'Topic is required' }, { status: 400 })

  const marketContext = market?.label
    ? `Target market: ${market.label}. ${market.currency ? `Pricing currency: ${market.currency}.` : ''} Tailor all examples, cultural references, pricing and problem framing to this specific market.`
    : 'Target market: Global — suitable for any region. Price suggestions in USD.'

  const prompt = `You are a digital product strategist with deep expertise in global markets.

A builder wants to create digital products around this topic or theme: "${topic}"

MARKET CONTEXT:
${marketContext}

Generate 6 highly specific digital product ideas tailored to this topic AND this market.
Each product must solve a real, urgent problem for a real person in this target market.
Use culturally relevant examples, locally meaningful language and market-appropriate pricing.

Respond ONLY with valid JSON — no markdown, no preamble:
{
  "topic": "${topic}",
  "marketLabel": "${market?.label ?? 'Global'}",
  "opportunities": [
    {
      "id": "t1",
      "title": "Specific product title",
      "category": "Category",
      "audience": "Very specific target audience for this market",
      "problemSolved": "Exact problem this solves in this market context",
      "format": "ebook|course|template|toolkit|checklist|workbook",
      "priceRangeMin": 9,
      "priceRangeMax": 97,
      "currency": "${market?.currency ?? 'USD ($)'}",
      "difficulty": "beginner|intermediate|advanced",
      "whyNow": "Why this is relevant and timely for this specific market"
    }
  ]
}`

  try {
    const res  = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
      body: JSON.stringify({
        model: 'gpt-4o-mini', max_tokens: 2000, temperature: 0.8,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    })
    const data = await res.json()
    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? '{}')
    return NextResponse.json({ opportunities: parsed.opportunities ?? [], topic, marketLabel: parsed.marketLabel ?? 'Global' })
  } catch (_) {
    return NextResponse.json({ error: 'Could not generate ideas. Please try again.' }, { status: 500 })
  }
}
