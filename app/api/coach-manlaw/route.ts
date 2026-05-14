// ============================================================
// Z2B 4M V3 — COACH MANLAW API ROUTE (UPGRADED)
// File: app/api/coach-manlaw/route.ts
// Laws: Context-aware · Genuine AI · Session memory
//       Replaces old programmed response system
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import { randomUUID }         from 'crypto'
import {
  loadBuilderContext,
  generateCoachResponse,
  buildStarterMessage,
  type CoachMessage,
} from '@/lib/v3/coach-engine'

async function getAuthUser(req: NextRequest) {
  const sb    = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return { user: null, error: 'No token' }
  const { data: { user }, error } = await sb.auth.getUser(token)
  return { user, error: error?.message ?? null }
}

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const action = body.action as string

    if (!['init', 'message'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Authenticate
    const { user, error: authError } = await getAuthUser(req)
    if (authError || !user) {
      return NextResponse.json({ error: 'Session expired. Please log in.' }, { status: 401 })
    }

    // Load builder's real context — wrap in try/catch (MEDIUM #5)
    let context
    try {
      context = await loadBuilderContext(user.id)
    } catch (e) {
      console.error('[coach-api] Context load failed:', e)
      return NextResponse.json({ error: 'Could not load your profile. Please try again.' }, { status: 500 })
    }

    // ── INIT: Start new coach session ─────────────────────────
    if (action === 'init') {
      const starterMessage = buildStarterMessage(context)
      const firstMessage: CoachMessage = {
        id:        randomUUID(),
        role:      'coach',
        content:   starterMessage,
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json({
        message: firstMessage,
        context: {
          firstName:        context.firstName,
          tierLabel:        context.tierLabel,
          hasActiveSession: context.hasActiveSession,
          currentGear:      context.currentGear,
          productTitle:     context.productTitle,
          productsLive:     context.productsLive,
        },
      })
    }

    // ── MESSAGE: Process builder message ──────────────────────
    if (action === 'message') {
      const { message, history } = body as {
        message: string
        history: CoachMessage[]
      }

      if (!message?.trim()) {
        return NextResponse.json({ error: 'No message provided.' }, { status: 400 })
      }

      if (message.trim().length > 1000) {
        return NextResponse.json({ error: 'Message too long. Please keep it under 1000 characters.' }, { status: 400 })
      }

      // HIGH: Rate limit via message count in this session (client-enforced)
      // Server-side: validate history length to prevent abuse
      const safeHistory = (history ?? [])
        .filter((m: CoachMessage) => m.role === 'user' || m.role === 'coach')  // MEDIUM #4: strip any injected roles
        .slice(-20)  // max 20 messages in history
        .map((m: CoachMessage) => ({ ...m, content: String(m.content).slice(0, 2000) }))  // cap each message

      if (safeHistory.length >= 50) {
        return NextResponse.json({ error: 'Session limit reached. Please start a new conversation.' }, { status: 429 })
      }

      const result = await generateCoachResponse({
        messages:   safeHistory,
        newMessage: message.trim(),
        context,
      })

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }

      const responseMessage: CoachMessage = {
        id:        randomUUID(),
        role:      'coach',
        content:   result.response,
        timestamp: new Date().toISOString(),
      }

      return NextResponse.json({ message: responseMessage })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error'
    console.error('[coach-manlaw-api] Unhandled error:', msg)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
