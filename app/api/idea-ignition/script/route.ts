// File: app/api/idea-ignition/script/route.ts — GLOBAL VERSION
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

  const { content, market } = await req.json()
  if (!content?.trim() || content.trim().length < 100)
    return NextResponse.json({ error: 'Please paste at least 100 characters of content.' }, { status: 400 })

  const excerpt = content.trim().slice(0, 3000)
  const marketContext = market?.label
    ? `Target market: ${market.label}. ${market.currency ? `Pricing currency: ${market.currency}.` : ''} Position all product ideas for this specific market.`
    : 'Target market: Global. Price in USD. Make products universally applicable.'

  const prompt = `You are a digital product strategist. A builder has pasted existing content.

MARKET CONTEXT:
${marketContext}

CONTENT:
---
${excerpt}
---

Identify 5 digital product ideas FROM or INSPIRED BY this content, positioned specifically for the target market above.
Use culturally relevant framing and market-appropriate pricing.

Respond ONLY with valid JSON:
{
  "contentSummary": "One sentence describing what the content is about",
  "marketLabel": "${market?.label ?? 'Global'}",
  "opportunities": [
    {
      "id": "s1",
      "title": "Specific product title",
      "category": "Category",
      "audience": "Specific audience in this market",
      "problemSolved": "Exact problem for this market",
      "format": "ebook|course|template|toolkit|checklist|workbook",
      "priceRangeMin": 9,
      "priceRangeMax": 97,
      "currency": "${market?.currency ?? 'USD ($)'}",
      "difficulty": "beginner|intermediate|advanced",
      "howContentHelps": "How the pasted content becomes this product"
    }
  ]
}`

  try {
    const res  = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
      body: JSON.stringify({
        model: 'gpt-4o-mini', max_tokens: 2000, temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    })
    const data = await res.json()
    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? '{}')
    return NextResponse.json({ opportunities: parsed.opportunities ?? [], contentSummary: parsed.contentSummary ?? '', marketLabel: parsed.marketLabel ?? 'Global' })
  } catch (_) {
    return NextResponse.json({ error: 'Could not analyse content. Please try again.' }, { status: 500 })
  }
}
