// File: app/api/idea-ignition/script/route.ts
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

  const { content } = await req.json()
  if (!content?.trim() || content.trim().length < 100) {
    return NextResponse.json({ error: 'Please paste at least 100 characters of content.' }, { status: 400 })
  }

  const excerpt = content.trim().slice(0, 3000)

  const prompt = `You are a digital product strategist. A builder has pasted existing content (a script, article, notes or extracted PDF text).

Analyse this content and identify 5 digital product ideas that could be built FROM or INSPIRED BY this content.

CONTENT:
---
${excerpt}
---

The builder already has expertise in this area. Help them package it into sellable digital products.

Respond ONLY with valid JSON:
{
  "contentSummary": "One sentence describing what the content is about",
  "opportunities": [
    {
      "id": "s1",
      "title": "Specific product title",
      "category": "Category",
      "audience": "Specific target audience",
      "problemSolved": "Exact problem this solves",
      "format": "ebook|course|template|toolkit|checklist|workbook",
      "priceRangeMin": 99,
      "priceRangeMax": 499,
      "difficulty": "beginner|intermediate|advanced",
      "howContentHelps": "How the pasted content becomes this product"
    }
  ]
}`

  try {
    const res  = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
      body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 2000, temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    })
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(text)
    return NextResponse.json({ opportunities: parsed.opportunities ?? [], contentSummary: parsed.contentSummary ?? '' })
  } catch (e) {
    return NextResponse.json({ error: 'Could not analyse content. Please try again.' }, { status: 500 })
  }
}
