// File: app/api/idea-ignition/products/route.ts
// Takes a selected opportunity + market + persona
// Returns 3 ranked product suggestions

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

  const { opportunity, market, persona } = await req.json()
  if (!opportunity?.title) return NextResponse.json({ error: 'Opportunity required' }, { status: 400 })

  const currency    = market?.currency?.split(' ')[0] ?? 'R'
  const country     = market?.country ?? 'South Africa'
  const personaText = persona?.summary ?? JSON.stringify(persona ?? {})

  const prompt = `You are Coach Manlaw — a $100M digital product strategist.

MARKET OPPORTUNITY SELECTED:
Title: ${opportunity.title}
Demand level: ${opportunity.demandLevel}
Trend evidence: ${opportunity.trendEvidence}
Target audience: ${opportunity.audience}
Problem: ${opportunity.problem}

BUYER PERSONA:
${personaText}

MARKET: ${country} · Currency: ${currency}

YOUR TASK:
Create exactly 3 digital product ideas based on this opportunity. Rank them by:
1. Market fit and demand signal strength
2. How well they match the buyer persona
3. How quickly and easily a non-expert builder can create them

Each product must:
- Have a specific, compelling title that makes the buyer say "this is for me"
- Solve ONE specific problem for ONE specific person
- Have a hook line that opens with the buyer's pain, not the product's features
- Be priced appropriately for this market

Respond ONLY with valid JSON:
{
  "products": [
    {
      "id": "p1",
      "title": "Specific product title",
      "subtitle": "The promise in one line",
      "format": "ebook|toolkit|course|template|framework|printable|workbook",
      "audience": "Exact target person description",
      "problemSolved": "The specific problem this solves",
      "hookLine": "First line that makes the buyer feel seen",
      "price": 299,
      "currency": "${currency}",
      "demandScore": 95,
      "reasoning": "Why this product ranks #1 — specific evidence"
    }
  ]
}`

  try {
    const res  = await fetch('https://api.openai.com/v1/chat/completions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
      body:    JSON.stringify({
        model:           'gpt-4o',
        max_tokens:      2000,
        temperature:     0.85,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data    = await res.json()
    const parsed  = JSON.parse(data.choices?.[0]?.message?.content ?? '{}')
    return NextResponse.json({ products: parsed.products ?? [] })
  } catch (e) {
    return NextResponse.json({ error: 'Could not generate products' }, { status: 500 })
  }
}
