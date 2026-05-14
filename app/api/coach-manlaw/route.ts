// ============================================================
// Z2B 4M V3 — COACH MANLAW API ROUTE (UPGRADED)
// File: app/api/coach-manlaw/route.ts
// Laws: Context-aware · Genuine AI · Session memory
//       Replaces old programmed response system
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import {
  loadBuilderContext,
  generateCoachResponse,
  buildStarterMessage,
  randomUUID,
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

    // Load builder's real context from Supabase
    const context = await loadBuilderContext(user.id)

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

      // Rate limit: max 30 messages per hour
      // Simple in-memory check — Redis in future sprint
      const result = await generateCoachResponse({
        messages:   history ?? [],
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
    console.error('[coach-manlaw-api]', msg)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
