// ============================================================
// app/api/amavulandlela/generate/route.ts
// AI caption generation — Z2B BrandPath + MyBrandPath
// Zero2Billionaires Amavulandlela Pty Ltd
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

const TIER_ORDER: Record<string,number> = {
  fam:0, starter:1, bronze:2, copper:3, silver:4, gold:5, platinum:6
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    const body = await req.json()
    const { prompt, mode } = body  // mode: 'z2b' | 'mybrand'

    if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 })

    // ── Z2B mode: requires Bronze+ ─────────────────────────
    if (mode === 'z2b') {
      if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

      const { data: profile } = await supabase
        .from('profiles').select('paid_tier').eq('id', user.id).single()

      if ((TIER_ORDER[profile?.paid_tier ?? 'fam'] ?? 0) < TIER_ORDER['bronze']) {
        return NextResponse.json({ error: 'Bronze tier required' }, { status: 403 })
      }
    }

    // ── MyBrandPath mode: requires active Ava subscription ─
    if (mode === 'mybrand') {
      if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

      const { data: sub } = await supabase
        .from('amavulandlela_subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .in('status', ['active', 'grace'])
        .single()

      if (!sub) return NextResponse.json({ error: 'MyBrandPath subscription required' }, { status: 403 })
    }

    // ── Get API key ────────────────────────────────────────
    const { data: keyRow } = await supabase
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
