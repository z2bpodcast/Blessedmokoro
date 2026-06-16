// ============================================================
// app/api/amavulandlela/generate/route.ts
// AI caption generation — Z2B BrandPath + MyBrandPath
// Zero2Billionaires Amavulandlela Pty Ltd
// Pattern: matches Coach Manlaw auth (SERVICE_ROLE_KEY + Bearer token)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

const TIER_ORDER: Record<string, number> = {
  fam: 0, starter: 1, bronze: 2, copper: 3, silver: 4, gold: 5, platinum: 6
}

// ── Auth helper — same pattern as Coach Manlaw ─────────────────
async function getUser(req: NextRequest) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return { user: null, sb }
  const { data: { user } } = await sb.auth.getUser(token)
  return { user, sb }
}

export async function POST(req: NextRequest) {
  try {
    const { user, sb } = await getUser(req)
    const body = await req.json()
    const { prompt, mode } = body

    if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 })

    // Z2B mode: requires Bronze+
    if (mode === 'z2b') {
      if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
      const { data: profile } = await sb
        .from('profiles').select('paid_tier').eq('id', user.id).single()
      if ((TIER_ORDER[profile?.paid_tier ?? 'fam'] ?? 0) < TIER_ORDER['bronze']) {
        return NextResponse.json({ error: 'Bronze tier required' }, { status: 403 })
      }
    }

    // MyBrandPath mode: requires active subscription
    if (mode === 'mybrand') {
      if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
      const { data: sub } = await sb
        .from('amavulandlela_subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .in('status', ['active', 'grace'])
        .single()
      if (!sub) return NextResponse.json({ error: 'MyBrandPath subscription required' }, { status: 403 })
    }

    // Get OpenAI API key from z2b_api_keys table, fallback to env
    const { data: keyRow } = await sb
      .from('z2b_api_keys').select('key_value').eq('key_name', 'OPENAI_API_KEY').single()

    const apiKey = keyRow?.key_value || process.env.OPENAI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

    const openai = new OpenAI({ apiKey })

    const systemPrompt = mode === 'z2b'
      ? 'You are the social media voice of Rev Mokoro Manana, founder of Zero2Billionaires Amavulandlela. Write in his direct, faith-based, South African pastoral-entrepreneur voice. Return ONLY the caption — no preamble, no explanation.'
      : 'You are a professional social media copywriter. Write persuasive, compliant, value-based captions in a neutral business tone for South African audiences. Never make income claims. Return ONLY the caption — no preamble, no explanation.'

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 600,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: prompt },
      ],
    })

    const caption = completion.choices[0]?.message?.content?.trim() ?? ''
    return NextResponse.json({ caption })

  } catch (error) {
    console.error('amavulandlela/generate error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
