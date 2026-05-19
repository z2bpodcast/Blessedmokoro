// ============================================================
// Z2B — COACH MANLAW API (SPRINT 20 UPGRADE)
// File: app/api/coach-manlaw/route.ts
// Phase C: Premium models · Full copywriter identity
// Claude Opus for psychology/copy · GPT-4o for execution plans
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import { COACH_MANLAW_SYSTEM_PROMPT, getCoachModel } from '@/lib/v3/coach-manlaw-prompt'

async function getUser(req: NextRequest) {
  const sb    = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return { user: null }
  const { data: { user } } = await sb.auth.getUser(token)
  return { user }
}

function detectTask(message: string): 'psychology' | 'structure' | 'copy' | 'execution' {
  const m = message.toLowerCase()
  if (m.includes('title') || m.includes('headline') || m.includes('description') || m.includes('copy') || m.includes('offer') || m.includes('write')) return 'copy'
  if (m.includes('who') || m.includes('persona') || m.includes('buyer') || m.includes('audience') || m.includes('trigger')) return 'psychology'
  if (m.includes('plan') || m.includes('step') || m.includes('how to') || m.includes('execute')) return 'execution'
  return 'structure'
}

export async function POST(req: NextRequest) {
  const { user } = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { message, history = [], sessionContext } = await req.json()
  if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })

  const task  = detectTask(message)
  const model = getCoachModel(task)
  const isOpus = model.includes('claude')

  // Build conversation history
  const messages = [
    ...history.slice(-10), // last 10 exchanges for context
    { role: 'user', content: message }
  ]

  // Add session context if available
  const systemWithContext = sessionContext
    ? `${COACH_MANLAW_SYSTEM_PROMPT}\n\n══ CURRENT SESSION CONTEXT ══\n${JSON.stringify(sessionContext, null, 2)}`
    : COACH_MANLAW_SYSTEM_PROMPT

  try {
    let responseText = ''

    if (isOpus) {
      // ── CLAUDE OPUS — Psychology, copy, offer architecture ──
      const res  = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type':      'application/json',
          'x-api-key':         process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model:      model,
          max_tokens: 2000,
          system:     systemWithContext,
          messages,
        }),
      })
      const data = await res.json()
      responseText = data.content?.[0]?.text ?? ''
    } else {
      // ── GPT-4o — Structure, frameworks, execution plans ──
      const res  = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
        },
        body: JSON.stringify({
          model:       model,
          max_tokens:  2000,
          temperature: 0.8,
          messages: [
            { role: 'system', content: systemWithContext },
            ...messages,
          ],
        }),
      })
      const data = await res.json()
      responseText = data.choices?.[0]?.message?.content ?? ''
    }

    if (!responseText) {
      return NextResponse.json({ error: 'Coach Manlaw is thinking — please try again.' }, { status: 500 })
    }

    return NextResponse.json({
      response: responseText,
      model:    'Z2B Intelligence Engine',
      task,
    })

  } catch (e) {
    console.error('[coach-manlaw]', e)
    return NextResponse.json({ error: 'Coach Manlaw is unavailable. Please try again.' }, { status: 500 })
  }
}
